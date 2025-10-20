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
// Trigger when a vendor document is updated
const onVendorUpdate = functions.firestore
    .document('vendors/{vendorId}')
    .onUpdate(async (change, context) => {
    try {
        const vendorId = context.params.vendorId;
        const beforeData = change.before.data();
        const afterData = change.after.data();
        console.log('Vendor updated:', vendorId);
        // Check if vendor was verified
        if (!beforeData.verified && afterData.verified) {
            console.log('Vendor verified:', vendorId);
            // Send notification to vendor
            await firebase_1.collections.notifications.add({
                userId: afterData.userId,
                type: 'vendor_verified',
                title: 'Profil ověřen!',
                message: 'Váš dodavatelský profil byl úspěšně ověřen a je nyní viditelný pro zákazníky.',
                data: {
                    vendorId,
                    action: 'view_vendor_profile'
                },
                read: false,
                createdAt: (0, firebase_1.serverTimestamp)()
            });
            // Update vendor stats
            await firebase_1.collections.vendors.doc(vendorId).update({
                'stats.verifiedAt': (0, firebase_1.serverTimestamp)()
            });
        }
        // Check if vendor was featured
        if (!beforeData.featured && afterData.featured) {
            console.log('Vendor featured:', vendorId);
            // Send notification to vendor
            await firebase_1.collections.notifications.add({
                userId: afterData.userId,
                type: 'vendor_featured',
                title: 'Profil zvýrazněn!',
                message: 'Váš profil byl zvýrazněn a bude se zobrazovat na předních pozicích.',
                data: {
                    vendorId,
                    action: 'view_vendor_profile'
                },
                read: false,
                createdAt: (0, firebase_1.serverTimestamp)()
            });
        }
        // Check if vendor was deactivated
        if (beforeData.active && !afterData.active) {
            console.log('Vendor deactivated:', vendorId);
            // Send notification to vendor
            await firebase_1.collections.notifications.add({
                userId: afterData.userId,
                type: 'system_update',
                title: 'Profil deaktivován',
                message: 'Váš dodavatelský profil byl deaktivován. Pro více informací nás kontaktujte.',
                data: {
                    vendorId,
                    action: 'contact_support'
                },
                read: false,
                createdAt: (0, firebase_1.serverTimestamp)()
            });
        }
        // Update search index (if using Algolia or similar)
        // This would be where you'd update external search services
        console.log('Vendor update processing completed:', vendorId);
    }
    catch (error) {
        console.error('Error processing vendor update:', error);
    }
});
exports.default = onVendorUpdate;
//# sourceMappingURL=onVendorUpdate.js.map