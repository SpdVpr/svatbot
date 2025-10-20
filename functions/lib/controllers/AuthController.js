"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const firebase_1 = require("../config/firebase");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone, role = types_1.UserRole.USER } = req.body;
            // Create user in Firebase Auth
            const userRecord = await firebase_1.auth.createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`,
                emailVerified: false
            });
            // Set user role in custom claims
            await (0, auth_1.setUserRole)(userRecord.uid, role);
            // Create user document in Firestore
            const userData = {
                email,
                firstName,
                lastName,
                phone: phone || null,
                role,
                verified: false,
                active: true,
                createdAt: (0, firebase_1.serverTimestamp)(),
                updatedAt: (0, firebase_1.serverTimestamp)()
            };
            await firebase_1.collections.users.doc(userRecord.uid).set(userData);
            // Send verification email
            try {
                const link = await firebase_1.auth.generateEmailVerificationLink(email);
                // TODO: Send custom email with the link
                console.log('Verification link:', link);
            }
            catch (emailError) {
                console.error('Failed to send verification email:', emailError);
            }
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please check your email for verification.',
                data: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName
                }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            if (error.code === 'auth/email-already-exists') {
                res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
            else if (error.code === 'auth/weak-password') {
                res.status(400).json({
                    success: false,
                    message: 'Password is too weak'
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Registration failed'
                });
            }
        }
    }
    // Login user (Firebase handles this on client side, this is for additional server logic)
    static async login(req, res) {
        try {
            const { email } = req.body;
            // Get user record
            const userRecord = await firebase_1.auth.getUserByEmail(email);
            // Update last login time
            await firebase_1.collections.users.doc(userRecord.uid).update({
                lastLoginAt: (0, firebase_1.serverTimestamp)(),
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    emailVerified: userRecord.emailVerified
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: 'Login failed'
            });
        }
    }
    // Get user profile
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            // Get user data from Firestore
            const userDoc = await firebase_1.collections.users.doc(req.user.uid).get();
            if (!userDoc.exists) {
                res.status(404).json({
                    success: false,
                    message: 'User profile not found'
                });
                return;
            }
            const userData = userDoc.data();
            // Get Firebase Auth data
            const authUser = await firebase_1.auth.getUser(req.user.uid);
            res.json({
                success: true,
                data: Object.assign({ uid: authUser.uid, email: authUser.email, emailVerified: authUser.emailVerified, displayName: authUser.displayName, photoURL: authUser.photoURL }, userData)
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user profile'
            });
        }
    }
    // Update user profile
    static async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { firstName, lastName, phone, displayName } = req.body;
            // Update Firebase Auth profile
            const authUpdates = {};
            if (displayName) {
                authUpdates.displayName = displayName;
            }
            else if (firstName && lastName) {
                authUpdates.displayName = `${firstName} ${lastName}`;
            }
            if (Object.keys(authUpdates).length > 0) {
                await firebase_1.auth.updateUser(req.user.uid, authUpdates);
            }
            // Update Firestore document
            const firestoreUpdates = {
                updatedAt: (0, firebase_1.serverTimestamp)()
            };
            if (firstName)
                firestoreUpdates.firstName = firstName;
            if (lastName)
                firestoreUpdates.lastName = lastName;
            if (phone !== undefined)
                firestoreUpdates.phone = phone;
            await firebase_1.collections.users.doc(req.user.uid).update(firestoreUpdates);
            res.json({
                success: true,
                message: 'Profile updated successfully'
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    }
    // Change password
    static async changePassword(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { newPassword } = req.body;
            // Update password in Firebase Auth
            await firebase_1.auth.updateUser(req.user.uid, {
                password: newPassword
            });
            // Revoke all refresh tokens to force re-authentication
            await firebase_1.auth.revokeRefreshTokens(req.user.uid);
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password'
            });
        }
    }
    // Verify email
    static async verifyEmail(req, res) {
        try {
            const { oobCode } = req.body;
            // Apply the email verification code
            await firebase_1.auth.applyActionCode(oobCode);
            res.json({
                success: true,
                message: 'Email verified successfully'
            });
        }
        catch (error) {
            console.error('Email verification error:', error);
            if (error.code === 'auth/invalid-action-code') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification code'
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Email verification failed'
                });
            }
        }
    }
    // Send verification email
    static async sendVerificationEmail(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const link = await firebase_1.auth.generateEmailVerificationLink(req.user.email);
            // TODO: Send custom email with the link
            console.log('Verification link:', link);
            res.json({
                success: true,
                message: 'Verification email sent successfully'
            });
        }
        catch (error) {
            console.error('Send verification email error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email'
            });
        }
    }
    // Send password reset email
    static async sendPasswordReset(req, res) {
        try {
            const { email } = req.body;
            const link = await firebase_1.auth.generatePasswordResetLink(email);
            // TODO: Send custom email with the link
            console.log('Password reset link:', link);
            res.json({
                success: true,
                message: 'Password reset email sent successfully'
            });
        }
        catch (error) {
            console.error('Send password reset error:', error);
            if (error.code === 'auth/user-not-found') {
                // Don't reveal if email exists
                res.json({
                    success: true,
                    message: 'If the email exists, a password reset link has been sent'
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send password reset email'
                });
            }
        }
    }
    // Confirm password reset
    static async confirmPasswordReset(req, res) {
        try {
            const { oobCode, newPassword } = req.body;
            // Confirm the password reset
            await firebase_1.auth.confirmPasswordReset(oobCode, newPassword);
            res.json({
                success: true,
                message: 'Password reset successfully'
            });
        }
        catch (error) {
            console.error('Confirm password reset error:', error);
            if (error.code === 'auth/invalid-action-code') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset code'
                });
            }
            else if (error.code === 'auth/weak-password') {
                res.status(400).json({
                    success: false,
                    message: 'Password is too weak'
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Password reset failed'
                });
            }
        }
    }
    // Logout (revoke refresh tokens)
    static async logout(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            // Revoke all refresh tokens
            await firebase_1.auth.revokeRefreshTokens(req.user.uid);
            res.json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
    }
    // Delete account
    static async deleteAccount(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            // Delete user data from Firestore
            await firebase_1.collections.users.doc(req.user.uid).delete();
            // Delete user from Firebase Auth
            await firebase_1.auth.deleteUser(req.user.uid);
            res.json({
                success: true,
                message: 'Account deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete account error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete account'
            });
        }
    }
    // Set user role (admin only)
    static async setUserRole(req, res) {
        try {
            if (!req.user || (req.user.role !== types_1.UserRole.ADMIN && req.user.role !== types_1.UserRole.SUPER_ADMIN)) {
                res.status(403).json({
                    success: false,
                    message: 'Admin privileges required'
                });
                return;
            }
            const { userId, role } = req.body;
            // Set custom claims
            await (0, auth_1.setUserRole)(userId, role);
            // Update Firestore document
            await firebase_1.collections.users.doc(userId).update({
                role,
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            res.json({
                success: true,
                message: 'User role updated successfully'
            });
        }
        catch (error) {
            console.error('Set user role error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to set user role'
            });
        }
    }
    // Get users (admin only)
    static async getUsers(req, res) {
        try {
            if (!req.user || (req.user.role !== types_1.UserRole.ADMIN && req.user.role !== types_1.UserRole.SUPER_ADMIN)) {
                res.status(403).json({
                    success: false,
                    message: 'Admin privileges required'
                });
                return;
            }
            const { limit = 20, startAfter } = req.query;
            let query = firebase_1.collections.users.orderBy('createdAt', 'desc').limit(Number(limit));
            if (startAfter) {
                const startAfterDoc = await firebase_1.collections.users.doc(startAfter).get();
                query = query.startAfter(startAfterDoc);
            }
            const snapshot = await query.get();
            const users = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            res.json({
                success: true,
                data: {
                    users,
                    hasMore: snapshot.docs.length === Number(limit)
                }
            });
        }
        catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get users'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map