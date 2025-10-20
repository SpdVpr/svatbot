"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All admin routes require authentication
router.use(auth_1.verifyToken);
// Dashboard and statistics
router.get('/stats', auth_1.requireAdmin, AdminController_1.AdminController.getStats);
router.get('/analytics', auth_1.requireAdmin, [
    (0, express_validator_1.query)('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Invalid start date'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('Invalid end date')
], validation_1.validateRequest, AdminController_1.AdminController.getAnalytics);
// Vendor management
router.get('/vendors', auth_1.requireAdmin, validation_1.validatePagination, [
    (0, express_validator_1.query)('search').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Search must be 2-100 characters'),
    (0, express_validator_1.query)('category').optional().isIn([
        'photographer', 'videographer', 'venue', 'catering', 'flowers',
        'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
        'transport', 'cake', 'jewelry', 'invitations', 'other'
    ]).withMessage('Invalid category'),
    (0, express_validator_1.query)('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    (0, express_validator_1.query)('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
    (0, express_validator_1.query)('active').optional().isBoolean().withMessage('Active must be a boolean')
], validation_1.validateRequest, AdminController_1.AdminController.getVendors);
router.get('/vendors/:id', auth_1.requireAdmin, AdminController_1.AdminController.getVendor);
router.put('/vendors/:id/verify', auth_1.requireAdmin, [(0, express_validator_1.body)('verified').isBoolean().withMessage('Verified must be a boolean')], validation_1.validateRequest, AdminController_1.AdminController.verifyVendor);
router.put('/vendors/:id/feature', auth_1.requireAdmin, [(0, express_validator_1.body)('featured').isBoolean().withMessage('Featured must be a boolean')], validation_1.validateRequest, AdminController_1.AdminController.featureVendor);
router.put('/vendors/:id/premium', auth_1.requireAdmin, [(0, express_validator_1.body)('premium').isBoolean().withMessage('Premium must be a boolean')], validation_1.validateRequest, AdminController_1.AdminController.setPremiumVendor);
router.put('/vendors/:id/activate', auth_1.requireAdmin, [(0, express_validator_1.body)('active').isBoolean().withMessage('Active must be a boolean')], validation_1.validateRequest, AdminController_1.AdminController.activateVendor);
router.delete('/vendors/:id', auth_1.requireSuperAdmin, AdminController_1.AdminController.deleteVendor);
// User management
router.get('/users', auth_1.requireAdmin, validation_1.validatePagination, [
    (0, express_validator_1.query)('search').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Search must be 2-100 characters'),
    (0, express_validator_1.query)('role').optional().isIn(['user', 'vendor', 'admin', 'super_admin']).withMessage('Invalid role'),
    (0, express_validator_1.query)('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    (0, express_validator_1.query)('active').optional().isBoolean().withMessage('Active must be a boolean')
], validation_1.validateRequest, AdminController_1.AdminController.getUsers);
router.get('/users/:id', auth_1.requireAdmin, AdminController_1.AdminController.getUser);
router.put('/users/:id/activate', auth_1.requireAdmin, [(0, express_validator_1.body)('active').isBoolean().withMessage('Active must be a boolean')], validation_1.validateRequest, AdminController_1.AdminController.activateUser);
router.put('/users/:id/verify', auth_1.requireAdmin, [(0, express_validator_1.body)('verified').isBoolean().withMessage('Verified must be a boolean')], validation_1.validateRequest, AdminController_1.AdminController.verifyUser);
router.put('/users/:id/role', auth_1.requireSuperAdmin, [(0, express_validator_1.body)('role').isIn(['user', 'vendor', 'admin', 'super_admin']).withMessage('Invalid role')], validation_1.validateRequest, AdminController_1.AdminController.changeUserRole);
router.delete('/users/:id', auth_1.requireSuperAdmin, AdminController_1.AdminController.deleteUser);
// Review management
router.get('/reviews', auth_1.requireAdmin, validation_1.validatePagination, [
    (0, express_validator_1.query)('vendorId').optional().isLength({ min: 1 }).withMessage('Invalid vendor ID'),
    (0, express_validator_1.query)('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    (0, express_validator_1.query)('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Min rating must be 1-5'),
    (0, express_validator_1.query)('maxRating').optional().isInt({ min: 1, max: 5 }).withMessage('Max rating must be 1-5')
], validation_1.validateRequest, AdminController_1.AdminController.getReviews);
router.put('/reviews/:id/verify', auth_1.requireAdmin, [(0, express_validator_1.body)('verified').isBoolean().withMessage('Verified must be a boolean')], validation_1.validateRequest, AdminController_1.AdminController.verifyReview);
router.delete('/reviews/:id', auth_1.requireAdmin, AdminController_1.AdminController.deleteReview);
// Inquiry management
router.get('/inquiries', auth_1.requireAdmin, validation_1.validatePagination, [
    (0, express_validator_1.query)('vendorId').optional().isLength({ min: 1 }).withMessage('Invalid vendor ID'),
    (0, express_validator_1.query)('status').optional().isIn(['new', 'viewed', 'responded', 'quoted', 'booked', 'declined', 'expired']).withMessage('Invalid status'),
    (0, express_validator_1.query)('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
], validation_1.validateRequest, AdminController_1.AdminController.getInquiries);
router.get('/inquiries/:id', auth_1.requireAdmin, AdminController_1.AdminController.getInquiry);
// System management
router.get('/system/health', auth_1.requireSuperAdmin, AdminController_1.AdminController.getSystemHealth);
router.get('/system/logs', auth_1.requireSuperAdmin, [
    (0, express_validator_1.query)('level').optional().isIn(['error', 'warn', 'info', 'debug']).withMessage('Invalid log level'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be 1-1000')
], validation_1.validateRequest, AdminController_1.AdminController.getSystemLogs);
router.post('/system/cache/clear', auth_1.requireSuperAdmin, AdminController_1.AdminController.clearCache);
router.post('/system/emails/test', auth_1.requireSuperAdmin, [(0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email required')], validation_1.validateRequest, AdminController_1.AdminController.testEmail);
// Export data
router.get('/export/vendors', auth_1.requireAdmin, [
    (0, express_validator_1.query)('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    (0, express_validator_1.query)('category').optional().isIn([
        'photographer', 'videographer', 'venue', 'catering', 'flowers',
        'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
        'transport', 'cake', 'jewelry', 'invitations', 'other'
    ]).withMessage('Invalid category')
], validation_1.validateRequest, AdminController_1.AdminController.exportVendors);
router.get('/export/users', auth_1.requireSuperAdmin, [
    (0, express_validator_1.query)('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    (0, express_validator_1.query)('role').optional().isIn(['user', 'vendor', 'admin', 'super_admin']).withMessage('Invalid role')
], validation_1.validateRequest, AdminController_1.AdminController.exportUsers);
router.get('/export/analytics', auth_1.requireAdmin, [
    (0, express_validator_1.query)('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    (0, express_validator_1.query)('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], validation_1.validateRequest, AdminController_1.AdminController.exportAnalytics);
// Notifications
router.post('/notifications/send', auth_1.requireAdmin, [
    (0, express_validator_1.body)('type').isIn(['inquiry_received', 'inquiry_response', 'review_received', 'vendor_verified', 'vendor_featured', 'system_update', 'promotion']).withMessage('Invalid notification type'),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    (0, express_validator_1.body)('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 characters'),
    (0, express_validator_1.body)('userIds').optional().isArray().withMessage('User IDs must be an array'),
    (0, express_validator_1.body)('sendToAll').optional().isBoolean().withMessage('Send to all must be a boolean')
], validation_1.validateRequest, AdminController_1.AdminController.sendNotification);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map