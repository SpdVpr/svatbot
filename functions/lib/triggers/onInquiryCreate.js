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
// Trigger when a new inquiry is created
const onInquiryCreate = functions.firestore
    .document('inquiries/{inquiryId}')
    .onCreate(async (snap, context) => {
    try {
        const inquiryId = context.params.inquiryId;
        const inquiryData = snap.data();
        console.log('New inquiry created:', inquiryId, 'for vendor:', inquiryData.vendorId);
        // Get vendor data
        const vendorDoc = await firebase_1.collections.vendors.doc(inquiryData.vendorId).get();
        if (!vendorDoc.exists) {
            console.error('Vendor not found:', inquiryData.vendorId);
            return;
        }
        const vendorData = vendorDoc.data();
        // Send notification to vendor
        await firebase_1.collections.notifications.add({
            userId: vendorData.userId,
            type: 'inquiry_received',
            title: 'Nová poptávka!',
            message: `Obdrželi jste novou poptávku od ${inquiryData.name}.`,
            data: {
                inquiryId,
                vendorId: inquiryData.vendorId,
                customerName: inquiryData.name,
                weddingDate: inquiryData.weddingDate,
                action: 'view_inquiry'
            },
            read: false,
            createdAt: (0, firebase_1.serverTimestamp)()
        });
        // Update vendor stats
        await firebase_1.collections.vendors.doc(inquiryData.vendorId).update({
            'stats.inquiries': firebase_1.FieldValue.increment(1),
            updatedAt: (0, firebase_1.serverTimestamp)()
        });
        // Track analytics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const analyticsRef = firebase_1.collections.analytics.doc(`${inquiryData.vendorId}_${today.toISOString().split('T')[0]}`);
        await analyticsRef.set({
            vendorId: inquiryData.vendorId,
            date: today,
            inquiries: firebase_1.FieldValue.increment(1)
        }, { merge: true });
        // Determine inquiry priority based on wedding date and budget
        let priority = 'normal';
        if (inquiryData.weddingDate) {
            const weddingDate = inquiryData.weddingDate.toDate();
            const daysUntilWedding = Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysUntilWedding <= 30) {
                priority = 'urgent';
            }
            else if (daysUntilWedding <= 90) {
                priority = 'high';
            }
        }
        if (inquiryData.budget && inquiryData.budget > 100000) {
            priority = priority === 'normal' ? 'high' : priority;
        }
        // Update inquiry with calculated priority
        await firebase_1.collections.inquiries.doc(inquiryId).update({
            priority,
            updatedAt: (0, firebase_1.serverTimestamp)()
        });
        // Send email notification to vendor (if email service is configured)
        // This would be where you'd integrate with your email service
        console.log('Would send email to:', vendorData.email);
        console.log('Inquiry processing completed:', inquiryId, 'priority:', priority);
    }
    catch (error) {
        console.error('Error processing new inquiry:', error);
    }
});
exports.default = onInquiryCreate;
//# sourceMappingURL=onInquiryCreate.js.map