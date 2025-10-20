"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("../config/firebase");
// Callable function to get vendors with filtering
const getVendors = functions.https.onCall(async (data, context) => {
    try {
        const { page = 1, limit = 20, category, city, region, minPrice, maxPrice, verified, featured, search, sortBy = 'createdAt', sortOrder = 'desc' } = data;
        // Validate pagination
        if (page < 1 || limit < 1 || limit > 100) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid pagination parameters');
        }
        let query = firebase_1.collections.vendors.where('active', '==', true);
        // Apply filters
        if (category) {
            query = query.where('category', '==', category);
        }
        if (city) {
            query = query.where('address.city', '==', city);
        }
        if (region) {
            query = query.where('address.region', '==', region);
        }
        if (verified !== undefined) {
            query = query.where('verified', '==', verified);
        }
        if (featured !== undefined) {
            query = query.where('featured', '==', featured);
        }
        // Apply sorting
        if (sortBy === 'name') {
            query = query.orderBy('name', sortOrder);
        }
        else if (sortBy === 'createdAt') {
            query = query.orderBy('createdAt', sortOrder);
        }
        else if (sortBy === 'rating') {
            query = query.orderBy('rating.overall', sortOrder);
        }
        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.limit(limit).offset(offset);
        const snapshot = await query.get();
        let vendors = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Apply search filter (client-side for now)
        if (search) {
            const searchTerm = search.toLowerCase();
            vendors = vendors.filter(vendor => {
                var _a, _b;
                return vendor.name.toLowerCase().includes(searchTerm) ||
                    vendor.description.toLowerCase().includes(searchTerm) ||
                    vendor.businessName.toLowerCase().includes(searchTerm) ||
                    ((_a = vendor.features) === null || _a === void 0 ? void 0 : _a.some((feature) => feature.toLowerCase().includes(searchTerm))) ||
                    ((_b = vendor.specialties) === null || _b === void 0 ? void 0 : _b.some((specialty) => specialty.toLowerCase().includes(searchTerm)));
            });
        }
        // Apply price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            vendors = vendors.filter(vendor => {
                if (!vendor.priceRange)
                    return true;
                const min = minPrice !== undefined ? minPrice : 0;
                const max = maxPrice !== undefined ? maxPrice : Infinity;
                return vendor.priceRange.min >= min && vendor.priceRange.max <= max;
            });
        }
        // Get total count for pagination
        const totalQuery = firebase_1.collections.vendors.where('active', '==', true);
        const totalSnapshot = await totalQuery.get();
        const total = totalSnapshot.size;
        // Check if user has favorited any vendors
        let favoriteVendorIds = [];
        if (context.auth) {
            const favoritesSnapshot = await firebase_1.collections.favorites
                .where('userId', '==', context.auth.uid)
                .get();
            favoriteVendorIds = favoritesSnapshot.docs.map(doc => doc.data().vendorId);
        }
        // Add isFavorited flag to vendors
        const vendorsWithFavorites = vendors.map(vendor => (Object.assign(Object.assign({}, vendor), { isFavorited: favoriteVendorIds.includes(vendor.id) })));
        return {
            success: true,
            data: {
                vendors: vendorsWithFavorites,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        };
    }
    catch (error) {
        console.error('Get vendors error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get vendors');
    }
});
exports.default = getVendors;
//# sourceMappingURL=getVendors.js.map