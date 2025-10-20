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
exports.AdminController = void 0;
const firebase_1 = require("../config/firebase");
const types_1 = require("../types");
class AdminController {
    // Get admin dashboard statistics
    static async getStats(req, res) {
        try {
            // Get user statistics
            const usersSnapshot = await firebase_1.collections.users.get();
            const users = usersSnapshot.docs.map(doc => doc.data());
            const userStats = {
                total: users.length,
                active: users.filter(user => user.active).length,
                verified: users.filter(user => user.verified).length,
                new: users.filter(user => {
                    var _a;
                    const createdAt = (_a = user.createdAt) === null || _a === void 0 ? void 0 : _a.toDate();
                    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return createdAt && createdAt > dayAgo;
                }).length
            };
            // Get vendor statistics
            const vendorsSnapshot = await firebase_1.collections.vendors.get();
            const vendors = vendorsSnapshot.docs.map(doc => doc.data());
            const vendorStats = {
                total: vendors.length,
                active: vendors.filter(vendor => vendor.active).length,
                verified: vendors.filter(vendor => vendor.verified).length,
                featured: vendors.filter(vendor => vendor.featured).length,
                pending: vendors.filter(vendor => !vendor.verified && vendor.active).length
            };
            // Get inquiry statistics
            const inquiriesSnapshot = await firebase_1.collections.inquiries.get();
            const inquiries = inquiriesSnapshot.docs.map(doc => doc.data());
            const inquiryStats = {
                total: inquiries.length,
                today: inquiries.filter(inquiry => {
                    var _a;
                    const createdAt = (_a = inquiry.createdAt) === null || _a === void 0 ? void 0 : _a.toDate();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return createdAt && createdAt >= today;
                }).length,
                pending: inquiries.filter(inquiry => inquiry.status === 'new').length
            };
            // Get review statistics
            const reviewsSnapshot = await firebase_1.collections.reviews.get();
            const reviews = reviewsSnapshot.docs.map(doc => doc.data());
            const reviewStats = {
                total: reviews.length,
                average: reviews.length > 0
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                    : 0
            };
            // Get category breakdown
            const categoryStats = Object.values(types_1.VendorCategory).map(category => ({
                category,
                count: vendors.filter(vendor => vendor.category === category).length
            }));
            // Get recent activity
            const recentVendors = vendors
                .sort((a, b) => { var _a, _b; return ((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()) - ((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.toDate()); })
                .slice(0, 5)
                .map(vendor => ({
                id: vendor.id,
                name: vendor.name,
                category: vendor.category,
                verified: vendor.verified,
                createdAt: vendor.createdAt
            }));
            const recentUsers = users
                .sort((a, b) => { var _a, _b; return ((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()) - ((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.toDate()); })
                .slice(0, 5)
                .map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                verified: user.verified,
                createdAt: user.createdAt
            }));
            const stats = {
                users: userStats,
                vendors: vendorStats,
                inquiries: inquiryStats,
                reviews: reviewStats
            };
            res.json({
                success: true,
                data: {
                    stats,
                    categories: categoryStats,
                    recent: {
                        vendors: recentVendors,
                        users: recentUsers
                    }
                }
            });
        }
        catch (error) {
            console.error('Get admin stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get admin statistics'
            });
        }
    }
    // Get detailed analytics
    static async getAnalytics(req, res) {
        try {
            const { period = '30d', startDate, endDate } = req.query;
            let start;
            let end = new Date();
            if (startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
            }
            else {
                switch (period) {
                    case '7d':
                        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case '90d':
                        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                        break;
                    case '1y':
                        start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                }
            }
            // Get analytics data for the period
            const analyticsSnapshot = await firebase_1.collections.analytics
                .where('date', '>=', start)
                .where('date', '<=', end)
                .orderBy('date')
                .get();
            const analyticsData = analyticsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Aggregate data by date
            const dailyStats = new Map();
            analyticsData.forEach(record => {
                const dateKey = record.date.toDate().toISOString().split('T')[0];
                if (!dailyStats.has(dateKey)) {
                    dailyStats.set(dateKey, {
                        date: dateKey,
                        views: 0,
                        inquiries: 0,
                        favorites: 0
                    });
                }
                const dayStats = dailyStats.get(dateKey);
                dayStats.views += record.views || 0;
                dayStats.inquiries += record.inquiries || 0;
                dayStats.favorites += record.favorites || 0;
            });
            const chartData = Array.from(dailyStats.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            res.json({
                success: true,
                data: {
                    period,
                    startDate: start,
                    endDate: end,
                    chartData,
                    summary: {
                        totalViews: chartData.reduce((sum, day) => sum + day.views, 0),
                        totalInquiries: chartData.reduce((sum, day) => sum + day.inquiries, 0),
                        totalFavorites: chartData.reduce((sum, day) => sum + day.favorites, 0)
                    }
                }
            });
        }
        catch (error) {
            console.error('Get admin analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get analytics data'
            });
        }
    }
    // Get all vendors for admin
    static async getVendors(req, res) {
        try {
            const { page = 1, limit = 20, search, category, verified, featured, active, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            let query = firebase_1.collections.vendors.orderBy(sortBy, sortOrder);
            // Apply filters
            if (category) {
                query = query.where('category', '==', category);
            }
            if (verified !== undefined) {
                query = query.where('verified', '==', verified === 'true');
            }
            if (featured !== undefined) {
                query = query.where('featured', '==', featured === 'true');
            }
            if (active !== undefined) {
                query = query.where('active', '==', active === 'true');
            }
            // Apply pagination
            const offset = (Number(page) - 1) * Number(limit);
            query = query.limit(Number(limit)).offset(offset);
            const snapshot = await query.get();
            let vendors = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            // Apply search filter (client-side)
            if (search) {
                const searchTerm = search.toLowerCase();
                vendors = vendors.filter(vendor => vendor.name.toLowerCase().includes(searchTerm) ||
                    vendor.businessName.toLowerCase().includes(searchTerm) ||
                    vendor.email.toLowerCase().includes(searchTerm));
            }
            // Get total count
            const totalSnapshot = await firebase_1.collections.vendors.get();
            const total = totalSnapshot.size;
            res.json({
                success: true,
                data: {
                    vendors,
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
            console.error('Get admin vendors error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get vendors'
            });
        }
    }
    // Verify vendor
    static async verifyVendor(req, res) {
        try {
            const { id } = req.params;
            const { verified } = req.body;
            await firebase_1.collections.vendors.doc(id).update({
                verified,
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            // Log admin action
            await firebase_1.collections.adminLogs.add({
                adminId: req.user.uid,
                action: 'vendor_verify',
                targetId: id,
                details: { verified },
                timestamp: (0, firebase_1.serverTimestamp)()
            });
            res.json({
                success: true,
                message: `Vendor ${verified ? 'verified' : 'unverified'} successfully`
            });
        }
        catch (error) {
            console.error('Verify vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update vendor verification'
            });
        }
    }
    // Feature vendor
    static async featureVendor(req, res) {
        try {
            const { id } = req.params;
            const { featured } = req.body;
            await firebase_1.collections.vendors.doc(id).update({
                featured,
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            // Log admin action
            await firebase_1.collections.adminLogs.add({
                adminId: req.user.uid,
                action: 'vendor_feature',
                targetId: id,
                details: { featured },
                timestamp: (0, firebase_1.serverTimestamp)()
            });
            res.json({
                success: true,
                message: `Vendor ${featured ? 'featured' : 'unfeatured'} successfully`
            });
        }
        catch (error) {
            console.error('Feature vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update vendor featured status'
            });
        }
    }
    // Set premium vendor
    static async setPremiumVendor(req, res) {
        try {
            const { id } = req.params;
            const { premium } = req.body;
            await firebase_1.collections.vendors.doc(id).update({
                premium,
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            res.json({
                success: true,
                message: `Vendor premium status ${premium ? 'enabled' : 'disabled'} successfully`
            });
        }
        catch (error) {
            console.error('Set premium vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update vendor premium status'
            });
        }
    }
    // Activate/deactivate vendor
    static async activateVendor(req, res) {
        try {
            const { id } = req.params;
            const { active } = req.body;
            await firebase_1.collections.vendors.doc(id).update({
                active,
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            res.json({
                success: true,
                message: `Vendor ${active ? 'activated' : 'deactivated'} successfully`
            });
        }
        catch (error) {
            console.error('Activate vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update vendor status'
            });
        }
    }
    // Delete vendor (super admin only)
    static async deleteVendor(req, res) {
        try {
            const { id } = req.params;
            await firebase_1.collections.vendors.doc(id).delete();
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
    // Get system health
    static async getSystemHealth(req, res) {
        try {
            // Check Firestore connectivity
            let firestoreHealth = true;
            try {
                await firebase_1.collections.users.limit(1).get();
            }
            catch (_a) {
                firestoreHealth = false;
            }
            // Check Storage connectivity
            let storageHealth = true;
            try {
                // Simple bucket access test
                const { bucket } = await Promise.resolve().then(() => __importStar(require('../config/firebase')));
                await bucket.getMetadata();
            }
            catch (_b) {
                storageHealth = false;
            }
            const overall = firestoreHealth && storageHealth;
            res.json({
                success: true,
                data: {
                    firestore: firestoreHealth,
                    storage: storageHealth,
                    overall,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error('Get system health error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get system health'
            });
        }
    }
    // Placeholder methods for other admin functions
    static async getVendor(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getUsers(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getUser(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async activateUser(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async verifyUser(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async changeUserRole(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async deleteUser(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getReviews(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async verifyReview(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async deleteReview(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getInquiries(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getInquiry(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async getSystemLogs(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async clearCache(req, res) {
        res.json({ success: true, message: 'Cache cleared (no cache to clear in Firebase)' });
    }
    static async testEmail(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async exportVendors(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async exportUsers(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async exportAnalytics(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
    static async sendNotification(req, res) {
        res.json({ success: true, message: 'Not implemented yet' });
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=AdminController.js.map