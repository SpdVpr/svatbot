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
// Trigger when a new review is created
const onReviewCreate = functions.firestore
    .document('reviews/{reviewId}')
    .onCreate(async (snap, context) => {
    try {
        const reviewId = context.params.reviewId;
        const reviewData = snap.data();
        console.log('New review created:', reviewId, 'for vendor:', reviewData.vendorId);
        // Get vendor data
        const vendorDoc = await firebase_1.collections.vendors.doc(reviewData.vendorId).get();
        if (!vendorDoc.exists) {
            console.error('Vendor not found:', reviewData.vendorId);
            return;
        }
        const vendorData = vendorDoc.data();
        // Send notification to vendor
        await firebase_1.collections.notifications.add({
            userId: vendorData.userId,
            type: 'review_received',
            title: 'Nové hodnocení!',
            message: `Obdrželi jste nové hodnocení s ${reviewData.rating} hvězdičkami.`,
            data: {
                reviewId,
                vendorId: reviewData.vendorId,
                rating: reviewData.rating,
                action: 'view_review'
            },
            read: false,
            createdAt: (0, firebase_1.serverTimestamp)()
        });
        // Update vendor rating statistics
        await updateVendorRating(reviewData.vendorId);
        // Update vendor stats
        await firebase_1.collections.vendors.doc(reviewData.vendorId).update({
            'stats.reviews': firebase_1.FieldValue.increment(1),
            updatedAt: (0, firebase_1.serverTimestamp)()
        });
        console.log('Review processing completed:', reviewId);
    }
    catch (error) {
        console.error('Error processing new review:', error);
    }
});
// Helper function to recalculate vendor rating
async function updateVendorRating(vendorId) {
    try {
        // Get all verified reviews for this vendor
        const reviewsSnapshot = await firebase_1.collections.reviews
            .where('vendorId', '==', vendorId)
            .where('verified', '==', true)
            .get();
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());
        if (reviews.length === 0) {
            // No reviews yet
            await firebase_1.collections.vendors.doc(vendorId).update({
                rating: {
                    overall: 0,
                    count: 0,
                    breakdown: {
                        quality: 0,
                        communication: 0,
                        value: 0,
                        professionalism: 0
                    }
                },
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            return;
        }
        // Calculate averages
        const overall = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        const quality = reviews.reduce((sum, review) => sum + review.quality, 0) / reviews.length;
        const communication = reviews.reduce((sum, review) => sum + review.communication, 0) / reviews.length;
        const value = reviews.reduce((sum, review) => sum + review.value, 0) / reviews.length;
        const professionalism = reviews.reduce((sum, review) => sum + review.professionalism, 0) / reviews.length;
        // Update vendor rating
        await firebase_1.collections.vendors.doc(vendorId).update({
            rating: {
                overall: Math.round(overall * 10) / 10,
                count: reviews.length,
                breakdown: {
                    quality: Math.round(quality * 10) / 10,
                    communication: Math.round(communication * 10) / 10,
                    value: Math.round(value * 10) / 10,
                    professionalism: Math.round(professionalism * 10) / 10
                }
            },
            updatedAt: (0, firebase_1.serverTimestamp)()
        });
        console.log('Vendor rating updated:', vendorId, 'new overall:', overall);
    }
    catch (error) {
        console.error('Error updating vendor rating:', error);
    }
}
exports.default = onReviewCreate;
//# sourceMappingURL=onReviewCreate.js.map