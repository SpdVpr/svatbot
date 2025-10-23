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
exports.setAdminRole = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * Cloud Function to set admin role for a user
 *
 * This is a one-time setup function. After setting up your first admin,
 * you can delete this function or restrict it to super_admin only.
 *
 * Usage:
 * 1. Deploy this function: firebase deploy --only functions:setAdminRole
 * 2. Call it from Firebase Console → Functions → setAdminRole → Test
 * 3. Pass data: { "userId": "USER_UID", "role": "super_admin" }
 * 4. After setup, you can delete this function
 */
exports.setAdminRole = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    var _a, _b, _c;
    try {
        const { userId, role, secretKey } = data;
        // Security: Require a secret key for first-time setup
        // After first admin is created, this function should check for super_admin role
        const SETUP_SECRET = ((_a = functions.config().admin) === null || _a === void 0 ? void 0 : _a.secret_key) || 'svatbot_admin_2024_secure_key';
        // Check if caller is already a super admin
        const isExistingAdmin = ((_c = (_b = context.auth) === null || _b === void 0 ? void 0 : _b.token) === null || _c === void 0 ? void 0 : _c.role) === 'super_admin';
        // For first-time setup, require secret key
        if (!isExistingAdmin && secretKey !== SETUP_SECRET) {
            console.error('Invalid secret key:', { provided: secretKey, expected: SETUP_SECRET });
            throw new functions.https.HttpsError('permission-denied', 'Invalid secret key or insufficient permissions');
        }
        // Validate inputs
        if (!userId || !role) {
            throw new functions.https.HttpsError('invalid-argument', 'userId and role are required');
        }
        if (!['super_admin', 'admin', 'moderator'].includes(role)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid role. Must be: super_admin, admin, or moderator');
        }
        // Get user
        const user = await admin.auth().getUser(userId);
        // Set custom claims
        await admin.auth().setCustomUserClaims(userId, { role });
        // Create admin user document in Firestore
        await admin.firestore().collection('adminUsers').doc(userId).set({
            email: user.email,
            name: user.displayName || 'Admin',
            role: role,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            permissions: {
                vendors: ['read', 'write', 'delete'],
                users: ['read', 'write'],
                marketplace: ['read', 'write', 'delete'],
                analytics: ['read'],
                messages: ['read', 'write'],
                feedback: ['read', 'write'],
                finance: ['read'],
                affiliate: ['read']
            }
        }, { merge: true });
        // Update user profile
        await admin.firestore().collection('users').doc(userId).set({
            role: role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return {
            success: true,
            message: `Role ${role} set for user ${user.email}`,
            userId: userId
        };
    }
    catch (error) {
        console.error('Error setting admin role:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to set admin role');
    }
});
//# sourceMappingURL=setAdminRole.js.map