"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Validation rules
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    (0, express_validator_1.body)('phone').optional().matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX')
];
const updateProfileValidation = [
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    (0, express_validator_1.body)('phone').optional().matches(/^\+420\d{9}$/).withMessage('Phone must be in format +420XXXXXXXXX')
];
// Public routes
router.post('/register', registerValidation, validation_1.validateRequest, AuthController_1.AuthController.register);
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
], validation_1.validateRequest, AuthController_1.AuthController.login);
router.post('/verify-email', [(0, express_validator_1.body)('oobCode').notEmpty().withMessage('Verification code is required')], validation_1.validateRequest, AuthController_1.AuthController.verifyEmail);
router.post('/send-verification', auth_1.verifyToken, AuthController_1.AuthController.sendVerificationEmail);
router.post('/reset-password', [(0, express_validator_1.body)('email').isEmail().normalizeEmail()], validation_1.validateRequest, AuthController_1.AuthController.sendPasswordReset);
router.post('/confirm-password-reset', [
    (0, express_validator_1.body)('oobCode').notEmpty().withMessage('Reset code is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validation_1.validateRequest, AuthController_1.AuthController.confirmPasswordReset);
// Protected routes
router.get('/profile', auth_1.verifyToken, AuthController_1.AuthController.getProfile);
router.put('/profile', auth_1.verifyToken, updateProfileValidation, validation_1.validateRequest, AuthController_1.AuthController.updateProfile);
router.post('/change-password', auth_1.verifyToken, [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], validation_1.validateRequest, AuthController_1.AuthController.changePassword);
router.post('/logout', auth_1.verifyToken, AuthController_1.AuthController.logout);
router.delete('/account', auth_1.verifyToken, [(0, express_validator_1.body)('password').notEmpty().withMessage('Password confirmation required')], validation_1.validateRequest, AuthController_1.AuthController.deleteAccount);
// Admin routes
router.post('/set-role', auth_1.verifyToken, [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'),
    (0, express_validator_1.body)('role').isIn(['user', 'vendor', 'admin', 'super_admin']).withMessage('Invalid role')
], validation_1.validateRequest, AuthController_1.AuthController.setUserRole);
router.get('/users', auth_1.verifyToken, AuthController_1.AuthController.getUsers);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map