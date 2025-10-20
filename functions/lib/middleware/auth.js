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
exports.revokeRefreshTokens = exports.generateCustomToken = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByEmail = exports.setUserRole = exports.requireVendorOwnership = exports.requireVerifiedEmail = exports.requireVendorOrAdmin = exports.requireSuperAdmin = exports.requireAdmin = exports.requireRole = exports.optionalAuth = exports.verifyToken = void 0;
const firebase_1 = require("../config/firebase");
const types_1 = require("../types");
// Verify Firebase Auth token
const verifyToken = async (req, res, next) => {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authorization header with Bearer token required'
            });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided'
            });
            return;
        }
        // Verify the token with Firebase Auth
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        // Get user custom claims for role information
        const userRecord = await firebase_1.auth.getUser(decodedToken.uid);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            role: ((_a = userRecord.customClaims) === null || _a === void 0 ? void 0 : _a.role) || types_1.UserRole.USER,
            verified: decodedToken.email_verified || false,
            customClaims: userRecord.customClaims
        };
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        if (error.code === 'auth/id-token-expired') {
            res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        else if (error.code === 'auth/id-token-revoked') {
            res.status(401).json({
                success: false,
                message: 'Token revoked'
            });
        }
        else {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }
};
exports.verifyToken = verifyToken;
// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            next();
            return;
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        const userRecord = await firebase_1.auth.getUser(decodedToken.uid);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            role: ((_a = userRecord.customClaims) === null || _a === void 0 ? void 0 : _a.role) || types_1.UserRole.USER,
            verified: decodedToken.email_verified || false,
            customClaims: userRecord.customClaims
        };
        next();
    }
    catch (error) {
        // Silently continue without authentication
        next();
    }
};
exports.optionalAuth = optionalAuth;
// Require specific role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
// Admin only
exports.requireAdmin = (0, exports.requireRole)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]);
// Super admin only
exports.requireSuperAdmin = (0, exports.requireRole)([types_1.UserRole.SUPER_ADMIN]);
// Vendor or admin
exports.requireVendorOrAdmin = (0, exports.requireRole)([
    types_1.UserRole.VENDOR,
    types_1.UserRole.ADMIN,
    types_1.UserRole.SUPER_ADMIN
]);
// Email verification required
const requireVerifiedEmail = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
        return;
    }
    if (!req.user.verified) {
        res.status(403).json({
            success: false,
            message: 'Email verification required'
        });
        return;
    }
    next();
};
exports.requireVerifiedEmail = requireVerifiedEmail;
// Check vendor ownership
const requireVendorOwnership = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        // Admins can access any vendor
        if (req.user.role === types_1.UserRole.ADMIN || req.user.role === types_1.UserRole.SUPER_ADMIN) {
            next();
            return;
        }
        const vendorId = req.params.id || req.params.vendorId;
        if (!vendorId) {
            res.status(400).json({
                success: false,
                message: 'Vendor ID required'
            });
            return;
        }
        // Import here to avoid circular dependency
        const { collections } = await Promise.resolve().then(() => __importStar(require('../config/firebase')));
        const vendorDoc = await collections.vendors.doc(vendorId).get();
        if (!vendorDoc.exists) {
            res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
            return;
        }
        const vendorData = vendorDoc.data();
        if ((vendorData === null || vendorData === void 0 ? void 0 : vendorData.userId) !== req.user.uid) {
            res.status(403).json({
                success: false,
                message: 'Access denied: You can only manage your own vendor profile'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Vendor ownership check error:', error);
        res.status(500).json({
            success: false,
            message: 'Authorization check failed'
        });
    }
};
exports.requireVendorOwnership = requireVendorOwnership;
// Set user role (admin function)
const setUserRole = async (uid, role) => {
    try {
        await firebase_1.auth.setCustomUserClaims(uid, { role });
    }
    catch (error) {
        console.error('Error setting user role:', error);
        throw error;
    }
};
exports.setUserRole = setUserRole;
// Get user by email
const getUserByEmail = async (email) => {
    try {
        return await firebase_1.auth.getUserByEmail(email);
    }
    catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
};
exports.getUserByEmail = getUserByEmail;
// Create user
const createUser = async (userData) => {
    try {
        return await firebase_1.auth.createUser(userData);
    }
    catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};
exports.createUser = createUser;
// Update user
const updateUser = async (uid, userData) => {
    try {
        return await firebase_1.auth.updateUser(uid, userData);
    }
    catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (uid) => {
    try {
        return await firebase_1.auth.deleteUser(uid);
    }
    catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
exports.deleteUser = deleteUser;
// Generate custom token
const generateCustomToken = async (uid, additionalClaims) => {
    try {
        return await firebase_1.auth.createCustomToken(uid, additionalClaims);
    }
    catch (error) {
        console.error('Error generating custom token:', error);
        throw error;
    }
};
exports.generateCustomToken = generateCustomToken;
// Revoke refresh tokens
const revokeRefreshTokens = async (uid) => {
    try {
        return await firebase_1.auth.revokeRefreshTokens(uid);
    }
    catch (error) {
        console.error('Error revoking refresh tokens:', error);
        throw error;
    }
};
exports.revokeRefreshTokens = revokeRefreshTokens;
//# sourceMappingURL=auth.js.map