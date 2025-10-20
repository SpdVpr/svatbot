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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("../config/firebase");
const firebase_2 = require("../config/firebase");
const types_1 = require("../types");
const slugify_1 = __importDefault(require("slugify"));
// Callable function to create a vendor
const createVendor = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        // Validate authentication
        const auth = (0, firebase_2.validateAuth)(context);
        // Validate required fields
        if (!data.name || !data.category || !data.description || !data.email) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
        }
        // Validate category
        if (!Object.values(types_1.VendorCategory).includes(data.category)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid vendor category');
        }
        // Check if user already has a vendor profile
        const existingVendorSnapshot = await firebase_1.collections.vendors
            .where('userId', '==', auth.uid)
            .get();
        if (!existingVendorSnapshot.empty) {
            throw new functions.https.HttpsError('already-exists', 'User already has a vendor profile');
        }
        // Generate unique slug
        let slug = (0, slugify_1.default)(data.name, { lower: true, strict: true });
        let slugExists = true;
        let counter = 1;
        while (slugExists) {
            const slugQuery = await firebase_1.collections.vendors.where('slug', '==', slug).get();
            if (slugQuery.empty) {
                slugExists = false;
            }
            else {
                slug = `${(0, slugify_1.default)(data.name, { lower: true, strict: true })}-${counter}`;
                counter++;
            }
        }
        // Prepare vendor data
        const vendorData = {
            userId: auth.uid,
            name: data.name,
            slug,
            category: data.category,
            description: data.description,
            shortDescription: data.shortDescription,
            businessName: data.businessName,
            businessId: data.businessId || null,
            website: data.website || null,
            email: data.email,
            phone: data.phone,
            workingRadius: data.workingRadius || 50,
            verified: ((_a = auth.token) === null || _a === void 0 ? void 0 : _a.role) === 'admin' || ((_b = auth.token) === null || _b === void 0 ? void 0 : _b.role) === 'super_admin',
            featured: false,
            premium: false,
            active: true,
            createdAt: (0, firebase_1.serverTimestamp)(),
            updatedAt: (0, firebase_1.serverTimestamp)(),
            address: {
                street: data.address.street || '',
                city: data.address.city,
                postalCode: data.address.postalCode || '',
                region: data.address.region || '',
                country: data.address.country || 'Czech Republic'
            },
            priceRange: data.priceRange || null,
            images: [],
            portfolioImages: [],
            features: data.features || [],
            specialties: data.specialties || [],
            availability: {
                weekdays: [true, true, true, true, true, true, true],
                timeSlots: [],
                blackoutDates: [],
                advanceBooking: 30
            },
            rating: {
                overall: 0,
                count: 0,
                breakdown: {
                    quality: 0,
                    communication: 0,
                    value: 0,
                    professionalism: 0
                }
            },
            stats: {
                views: 0,
                inquiries: 0,
                bookings: 0,
                favorites: 0,
                responseRate: 0,
                responseTime: 0
            }
        };
        // Create vendor document
        const vendorRef = await firebase_1.collections.vendors.add(vendorData);
        // Send notification to user
        await firebase_1.collections.notifications.add({
            userId: auth.uid,
            type: 'vendor_verified',
            title: 'Dodavatelský profil vytvořen!',
            message: vendorData.verified
                ? 'Váš profil byl vytvořen a ověřen. Je nyní viditelný pro zákazníky.'
                : 'Váš profil byl vytvořen a čeká na ověření administrátorem.',
            data: {
                vendorId: vendorRef.id,
                action: 'view_vendor_profile'
            },
            read: false,
            createdAt: (0, firebase_1.serverTimestamp)()
        });
        // Log activity
        console.log('Vendor created:', vendorRef.id, 'by user:', auth.uid);
        return {
            success: true,
            message: 'Vendor created successfully',
            data: {
                vendorId: vendorRef.id,
                vendor: Object.assign({ id: vendorRef.id }, vendorData)
            }
        };
    }
    catch (error) {
        console.error('Create vendor error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to create vendor');
    }
});
exports.default = createVendor;
//# sourceMappingURL=createVendor.js.map