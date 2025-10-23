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
const types_1 = require("../types");
const emailService_1 = require("../services/emailService");
// Trigger when a new user is created in Firebase Auth
const onUserCreate = functions.region('europe-west1').auth.user().onCreate(async (user) => {
    var _a, _b;
    try {
        console.log('New user created:', user.uid, user.email);
        // Create user document in Firestore
        const userData = {
            email: user.email || '',
            firstName: ((_a = user.displayName) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || '',
            lastName: ((_b = user.displayName) === null || _b === void 0 ? void 0 : _b.split(' ').slice(1).join(' ')) || '',
            phone: user.phoneNumber || null,
            role: types_1.UserRole.USER,
            verified: user.emailVerified || false,
            active: true,
            createdAt: (0, firebase_1.serverTimestamp)(),
            updatedAt: (0, firebase_1.serverTimestamp)(),
            lastLoginAt: null,
            profileImage: user.photoURL || null,
            preferences: {
                emailNotifications: true,
                pushNotifications: true,
                marketingEmails: false,
                language: 'cs',
                currency: 'CZK'
            }
        };
        await firebase_1.collections.users.doc(user.uid).set(userData);
        // Send welcome notification
        await firebase_1.collections.notifications.add({
            userId: user.uid,
            type: 'system_update',
            title: 'Vítejte v SvatBot!',
            message: 'Děkujeme za registraci. Začněte prozkoumáním našich dodavatelů.',
            data: {
                action: 'explore_vendors'
            },
            read: false,
            createdAt: (0, firebase_1.serverTimestamp)()
        });
        // Send registration email
        if (user.email && userData.firstName) {
            try {
                await (0, emailService_1.sendRegistrationEmail)(user.email, userData.firstName, user.uid);
                console.log('Registration email sent to:', user.email);
            }
            catch (emailError) {
                console.error('Error sending registration email:', emailError);
                // Don't fail user creation if email fails
            }
        }
        console.log('User document created successfully:', user.uid);
    }
    catch (error) {
        console.error('Error creating user document:', error);
        // Don't throw error to avoid blocking user creation
    }
});
exports.default = onUserCreate;
//# sourceMappingURL=onUserCreate.js.map