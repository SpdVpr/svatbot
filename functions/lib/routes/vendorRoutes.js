"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VendorController_1 = require("../controllers/VendorController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Validation rules
const createVendorValidation = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    (0, express_validator_1.body)('category').isIn([
        'photographer', 'videographer', 'venue', 'catering', 'flowers',
        'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
        'transport', 'cake', 'jewelry', 'invitations', 'other'
    ]).withMessage('Invalid category'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 50, max: 2000 }).withMessage('Description must be 50-2000 characters'),
    (0, express_validator_1.body)('shortDescription').trim().isLength({ min: 10, max: 150 }).withMessage('Short description must be 10-150 characters'),
    (0, express_validator_1.body)('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX'),
    (0, express_validator_1.body)('address.city').trim().isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
    (0, express_validator_1.body)('address.country').optional().trim().isLength({ max: 50 }).withMessage('Country must be less than 50 characters')
];
const updateVendorValidation = [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    (0, express_validator_1.body)('category').optional().isIn([
        'photographer', 'videographer', 'venue', 'catering', 'flowers',
        'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
        'transport', 'cake', 'jewelry', 'invitations', 'other'
    ]).withMessage('Invalid category'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 50, max: 2000 }).withMessage('Description must be 50-2000 characters'),
    (0, express_validator_1.body)('shortDescription').optional().trim().isLength({ min: 10, max: 150 }).withMessage('Short description must be 10-150 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').optional().matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX')
];
const createServiceValidation = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Service name must be 2-100 characters'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
    (0, express_validator_1.body)('price').optional().isNumeric().withMessage('Price must be a number'),
    (0, express_validator_1.body)('priceType').isIn(['fixed', 'per_person', 'per_hour', 'per_day', 'package', 'custom']).withMessage('Invalid price type'),
    (0, express_validator_1.body)('includes').optional().isArray().withMessage('Includes must be an array')
];
const createReviewValidation = [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('text').trim().isLength({ min: 10, max: 1000 }).withMessage('Review text must be 10-1000 characters'),
    (0, express_validator_1.body)('quality').optional().isInt({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),
    (0, express_validator_1.body)('communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
    (0, express_validator_1.body)('value').optional().isInt({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),
    (0, express_validator_1.body)('professionalism').optional().isInt({ min: 1, max: 5 }).withMessage('Professionalism rating must be between 1 and 5')
];
const createInquiryValidation = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').optional().matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX'),
    (0, express_validator_1.body)('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters'),
    (0, express_validator_1.body)('weddingDate').optional().isISO8601().withMessage('Wedding date must be a valid date'),
    (0, express_validator_1.body)('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be a positive number'),
    (0, express_validator_1.body)('budget').optional().isNumeric().withMessage('Budget must be a number')
];
// Public routes
router.get('/', validation_1.validatePagination, validation_1.validateSort, validation_1.validateSearch, [
    (0, express_validator_1.query)('category').optional().isIn([
        'photographer', 'videographer', 'venue', 'catering', 'flowers',
        'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
        'transport', 'cake', 'jewelry', 'invitations', 'other'
    ]).withMessage('Invalid category'),
    (0, express_validator_1.query)('city').optional().trim().isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
    (0, express_validator_1.query)('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
    (0, express_validator_1.query)('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
    (0, express_validator_1.query)('minPrice').optional().isNumeric().withMessage('Min price must be a number'),
    (0, express_validator_1.query)('maxPrice').optional().isNumeric().withMessage('Max price must be a number')
], validation_1.validateRequest, VendorController_1.VendorController.getVendors);
router.get('/categories', VendorController_1.VendorController.getCategories);
router.get('/search/suggestions', [(0, express_validator_1.query)('q').trim().isLength({ min: 2, max: 50 }).withMessage('Query must be 2-50 characters')], validation_1.validateRequest, VendorController_1.VendorController.getSearchSuggestions);
router.get('/:id', auth_1.optionalAuth, VendorController_1.VendorController.getVendor);
// Vendor services
router.get('/:id/services', VendorController_1.VendorController.getVendorServices);
// Vendor reviews
router.get('/:id/reviews', validation_1.validatePagination, validation_1.validateSort, VendorController_1.VendorController.getVendorReviews);
// Protected routes
router.post('/', auth_1.verifyToken, createVendorValidation, validation_1.validateRequest, VendorController_1.VendorController.createVendor);
router.put('/:id', auth_1.verifyToken, auth_1.requireVendorOwnership, updateVendorValidation, validation_1.validateRequest, VendorController_1.VendorController.updateVendor);
router.delete('/:id', auth_1.verifyToken, auth_1.requireVendorOwnership, VendorController_1.VendorController.deleteVendor);
// Vendor services management
router.post('/:id/services', auth_1.verifyToken, auth_1.requireVendorOwnership, createServiceValidation, validation_1.validateRequest, VendorController_1.VendorController.createService);
router.put('/:id/services/:serviceId', auth_1.verifyToken, auth_1.requireVendorOwnership, createServiceValidation, validation_1.validateRequest, VendorController_1.VendorController.updateService);
router.delete('/:id/services/:serviceId', auth_1.verifyToken, auth_1.requireVendorOwnership, VendorController_1.VendorController.deleteService);
// Vendor images management
router.post('/:id/images', auth_1.verifyToken, auth_1.requireVendorOwnership, VendorController_1.VendorController.uploadImages);
router.delete('/:id/images/:imageId', auth_1.verifyToken, auth_1.requireVendorOwnership, VendorController_1.VendorController.deleteImage);
router.put('/:id/images/reorder', auth_1.verifyToken, auth_1.requireVendorOwnership, [(0, express_validator_1.body)('imageIds').isArray().withMessage('Image IDs must be an array')], validation_1.validateRequest, VendorController_1.VendorController.reorderImages);
// Reviews
router.post('/:id/reviews', auth_1.verifyToken, createReviewValidation, validation_1.validateRequest, VendorController_1.VendorController.createReview);
// Favorites
router.post('/:id/favorite', auth_1.verifyToken, VendorController_1.VendorController.toggleFavorite);
router.get('/favorites/my', auth_1.verifyToken, validation_1.validatePagination, VendorController_1.VendorController.getMyFavorites);
// Inquiries
router.post('/:id/inquiries', auth_1.optionalAuth, createInquiryValidation, validation_1.validateRequest, VendorController_1.VendorController.createInquiry);
router.get('/:id/inquiries', auth_1.verifyToken, auth_1.requireVendorOwnership, validation_1.validatePagination, validation_1.validateSort, VendorController_1.VendorController.getVendorInquiries);
router.put('/:id/inquiries/:inquiryId', auth_1.verifyToken, auth_1.requireVendorOwnership, [
    (0, express_validator_1.body)('status').optional().isIn(['new', 'viewed', 'responded', 'quoted', 'booked', 'declined', 'expired']).withMessage('Invalid status'),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('response').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Response must be 1-1000 characters')
], validation_1.validateRequest, VendorController_1.VendorController.updateInquiry);
// Analytics
router.get('/:id/analytics', auth_1.verifyToken, auth_1.requireVendorOwnership, [
    (0, express_validator_1.query)('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Invalid start date'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('Invalid end date')
], validation_1.validateRequest, VendorController_1.VendorController.getAnalytics);
exports.default = router;
//# sourceMappingURL=vendorRoutes.js.map