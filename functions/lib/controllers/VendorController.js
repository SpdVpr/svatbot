"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorController = void 0;
const firebase_1 = require("../config/firebase");
const types_1 = require("../types");
const slugify_1 = __importDefault(require("slugify"));
class VendorController {
    // Get vendors with filtering and pagination
    static async getVendors(req, res) {
        try {
            const { page = 1, limit = 20, category, city, region, minPrice, maxPrice, verified, featured, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
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
                query = query.where('verified', '==', verified === 'true');
            }
            if (featured !== undefined) {
                query = query.where('featured', '==', featured === 'true');
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
            const offset = (Number(page) - 1) * Number(limit);
            query = query.limit(Number(limit)).offset(offset);
            const snapshot = await query.get();
            const vendors = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Apply search filter (client-side for now, could be improved with Algolia)
            let filteredVendors = vendors;
            if (search) {
                const searchTerm = search.toLowerCase();
                filteredVendors = vendors.filter(vendor => vendor.name.toLowerCase().includes(searchTerm) ||
                    vendor.description.toLowerCase().includes(searchTerm) ||
                    vendor.businessName.toLowerCase().includes(searchTerm));
            }
            // Apply price range filter
            if (minPrice || maxPrice) {
                filteredVendors = filteredVendors.filter(vendor => {
                    if (!vendor.priceRange)
                        return true;
                    const min = minPrice ? Number(minPrice) : 0;
                    const max = maxPrice ? Number(maxPrice) : Infinity;
                    return vendor.priceRange.min >= min && vendor.priceRange.max <= max;
                });
            }
            // Get total count for pagination
            const totalQuery = firebase_1.collections.vendors.where('active', '==', true);
            const totalSnapshot = await totalQuery.get();
            const total = totalSnapshot.size;
            res.json({
                success: true,
                data: {
                    vendors: filteredVendors,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit)),
                        hasNext: Number(page) * Number(limit) < total,
                        hasPrev: Number(page) > 1
                    }
                }
            });
        }
        catch (error) {
            console.error('Get vendors error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get vendors'
            });
        }
    }
    // Get vendor by ID
    static async getVendor(req, res) {
        var _a, _b;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
            const vendorDoc = await firebase_1.collections.vendors.doc(id).get();
            if (!vendorDoc.exists) {
                res.status(404).json({
                    success: false,
                    message: 'Vendor not found'
                });
                return;
            }
            const vendorData = vendorDoc.data();
            // Check if vendor is active (unless it's the owner or admin)
            if (!vendorData.active && vendorData.userId !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
                res.status(404).json({
                    success: false,
                    message: 'Vendor not found'
                });
                return;
            }
            // Get services
            const servicesSnapshot = await firebase_1.collections.services
                .where('vendorId', '==', id)
                .where('active', '==', true)
                .orderBy('sortOrder')
                .get();
            const services = servicesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Get recent reviews
            const reviewsSnapshot = await firebase_1.collections.reviews
                .where('vendorId', '==', id)
                .where('verified', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();
            const reviews = reviewsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Check if user has favorited this vendor
            let isFavorited = false;
            if (userId) {
                const favoriteDoc = await firebase_1.collections.favorites
                    .where('userId', '==', userId)
                    .where('vendorId', '==', id)
                    .get();
                isFavorited = !favoriteDoc.empty;
            }
            // Track view
            if (userId) {
                await VendorController.trackView(id, userId);
            }
            res.json({
                success: true,
                data: {
                    vendor: Object.assign(Object.assign({ id: vendorDoc.id }, vendorData), { services,
                        reviews,
                        isFavorited })
                }
            });
        }
        catch (error) {
            console.error('Get vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get vendor'
            });
        }
    }
    // Create vendor
    static async createVendor(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            // Check if user already has a vendor profile
            const existingVendorSnapshot = await firebase_1.collections.vendors
                .where('userId', '==', req.user.uid)
                .get();
            if (!existingVendorSnapshot.empty) {
                res.status(400).json({
                    success: false,
                    message: 'User already has a vendor profile'
                });
                return;
            }
            const { name, category, description, shortDescription, businessName, businessId, website, email, phone, workingRadius = 50, address, priceRange, features = [], specialties = [] } = req.body;
            // Generate unique slug
            let slug = (0, slugify_1.default)(name, { lower: true, strict: true });
            let slugExists = true;
            let counter = 1;
            while (slugExists) {
                const slugQuery = await firebase_1.collections.vendors.where('slug', '==', slug).get();
                if (slugQuery.empty) {
                    slugExists = false;
                }
                else {
                    slug = `${(0, slugify_1.default)(name, { lower: true, strict: true })}-${counter}`;
                    counter++;
                }
            }
            const vendorData = {
                userId: req.user.uid,
                name,
                slug,
                category: category,
                description,
                shortDescription,
                businessName,
                businessId: businessId || null,
                website: website || null,
                email,
                phone,
                workingRadius,
                verified: req.user.role === 'admin' || req.user.role === 'super_admin',
                featured: false,
                premium: false,
                active: true,
                createdAt: (0, firebase_1.serverTimestamp)(),
                updatedAt: (0, firebase_1.serverTimestamp)(),
                address,
                priceRange: priceRange || null,
                images: [],
                portfolioImages: [],
                features,
                specialties,
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
            const vendorRef = await firebase_1.collections.vendors.add(vendorData);
            res.status(201).json({
                success: true,
                message: 'Vendor created successfully',
                data: {
                    vendor: Object.assign({ id: vendorRef.id }, vendorData)
                }
            });
        }
        catch (error) {
            console.error('Create vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create vendor'
            });
        }
    }
    // Update vendor
    static async updateVendor(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            // Remove undefined values
            const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, value]) => value !== undefined));
            cleanUpdates.updatedAt = (0, firebase_1.serverTimestamp)();
            await firebase_1.collections.vendors.doc(id).update(cleanUpdates);
            res.json({
                success: true,
                message: 'Vendor updated successfully'
            });
        }
        catch (error) {
            console.error('Update vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update vendor'
            });
        }
    }
    // Delete vendor (soft delete)
    static async deleteVendor(req, res) {
        try {
            const { id } = req.params;
            await firebase_1.collections.vendors.doc(id).update({
                active: false,
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            res.json({
                success: true,
                message: 'Vendor deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete vendor'
            });
        }
    }
    // Get vendor categories with counts
    static async getCategories(req, res) {
        try {
            const categories = Object.values(types_1.VendorCategory);
            const categoryCounts = {};
            for (const category of categories) {
                const snapshot = await firebase_1.collections.vendors
                    .where('category', '==', category)
                    .where('active', '==', true)
                    .get();
                categoryCounts[category] = snapshot.size;
            }
            res.json({
                success: true,
                data: {
                    categories: categories.map(category => ({
                        value: category,
                        label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
                        count: categoryCounts[category] || 0
                    }))
                }
            });
        }
        catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get categories'
            });
        }
    }
    // Get search suggestions
    static async getSearchSuggestions(req, res) {
        try {
            const { q } = req.query;
            const searchTerm = q.toLowerCase();
            // Get vendors matching the search term
            const vendorsSnapshot = await firebase_1.collections.vendors
                .where('active', '==', true)
                .limit(10)
                .get();
            const suggestions = vendorsSnapshot.docs
                .map(doc => doc.data())
                .filter(vendor => vendor.name.toLowerCase().includes(searchTerm) ||
                vendor.businessName.toLowerCase().includes(searchTerm))
                .map(vendor => ({
                type: 'vendor',
                value: vendor.name,
                category: vendor.category
            }))
                .slice(0, 5);
            // Add category suggestions
            const categories = Object.values(types_1.VendorCategory)
                .filter(category => category.includes(searchTerm))
                .map(category => ({
                type: 'category',
                value: category,
                category: null
            }))
                .slice(0, 3);
            res.json({
                success: true,
                data: {
                    suggestions: [...suggestions, ...categories]
                }
            });
        }
        catch (error) {
            console.error('Get search suggestions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get search suggestions'
            });
        }
    }
    // Track vendor view for analytics
    static async trackView(vendorId, userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const analyticsRef = firebase_1.collections.analytics.doc(`${vendorId}_${today.toISOString().split('T')[0]}`);
            await analyticsRef.set({
                vendorId,
                date: today,
                views: firebase_1.FieldValue.increment(1)
            }, { merge: true });
            // Update vendor stats
            await firebase_1.collections.vendors.doc(vendorId).update({
                'stats.views': firebase_1.FieldValue.increment(1)
            });
        }
        catch (error) {
            console.error('Track view error:', error);
            // Don't fail the request if analytics fail
        }
    }
    // Placeholder methods for other vendor operations
    static async getVendorServices(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async createService(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async updateService(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async deleteService(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async uploadImages(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async deleteImage(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async reorderImages(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getVendorReviews(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async createReview(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async toggleFavorite(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getMyFavorites(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async createInquiry(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getVendorInquiries(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async updateInquiry(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getAnalytics(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
}
exports.VendorController = VendorController;
//# sourceMappingURL=VendorController.js.map