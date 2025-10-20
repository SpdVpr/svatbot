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
// Scheduled function to run daily cleanup tasks
const scheduledCleanup = functions.pubsub
    .schedule('0 2 * * *') // Run at 2 AM every day
    .timeZone('Europe/Prague')
    .onRun(async (context) => {
    try {
        console.log('Starting scheduled cleanup...');
        // Clean up expired inquiries
        await cleanupExpiredInquiries();
        // Clean up old notifications
        await cleanupOldNotifications();
        // Clean up old analytics data
        await cleanupOldAnalytics();
        // Update vendor response rates
        await updateVendorResponseRates();
        console.log('Scheduled cleanup completed successfully');
    }
    catch (error) {
        console.error('Error during scheduled cleanup:', error);
    }
});
// Clean up inquiries older than 6 months with no response
async function cleanupExpiredInquiries() {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const expiredInquiriesSnapshot = await firebase_1.collections.inquiries
            .where('createdAt', '<', sixMonthsAgo)
            .where('status', 'in', ['new', 'viewed'])
            .get();
        const batch = firebase_1.collections.inquiries.firestore.batch();
        let updateCount = 0;
        expiredInquiriesSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                status: 'expired',
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            updateCount++;
        });
        if (updateCount > 0) {
            await batch.commit();
            console.log(`Marked ${updateCount} inquiries as expired`);
        }
    }
    catch (error) {
        console.error('Error cleaning up expired inquiries:', error);
    }
}
// Clean up notifications older than 3 months
async function cleanupOldNotifications() {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const oldNotificationsSnapshot = await firebase_1.collections.notifications
            .where('createdAt', '<', threeMonthsAgo)
            .where('read', '==', true)
            .limit(500) // Process in batches
            .get();
        const batch = firebase_1.collections.notifications.firestore.batch();
        let deleteCount = 0;
        oldNotificationsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
            deleteCount++;
        });
        if (deleteCount > 0) {
            await batch.commit();
            console.log(`Deleted ${deleteCount} old notifications`);
        }
    }
    catch (error) {
        console.error('Error cleaning up old notifications:', error);
    }
}
// Clean up analytics data older than 2 years
async function cleanupOldAnalytics() {
    try {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const oldAnalyticsSnapshot = await firebase_1.collections.analytics
            .where('date', '<', twoYearsAgo)
            .limit(500) // Process in batches
            .get();
        const batch = firebase_1.collections.analytics.firestore.batch();
        let deleteCount = 0;
        oldAnalyticsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
            deleteCount++;
        });
        if (deleteCount > 0) {
            await batch.commit();
            console.log(`Deleted ${deleteCount} old analytics records`);
        }
    }
    catch (error) {
        console.error('Error cleaning up old analytics:', error);
    }
}
// Update vendor response rates based on inquiry responses
async function updateVendorResponseRates() {
    try {
        const vendorsSnapshot = await firebase_1.collections.vendors
            .where('active', '==', true)
            .get();
        const batch = firebase_1.collections.vendors.firestore.batch();
        let updateCount = 0;
        for (const vendorDoc of vendorsSnapshot.docs) {
            const vendorId = vendorDoc.id;
            // Get inquiries from last 3 months
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const inquiriesSnapshot = await firebase_1.collections.inquiries
                .where('vendorId', '==', vendorId)
                .where('createdAt', '>=', threeMonthsAgo)
                .get();
            const inquiries = inquiriesSnapshot.docs.map(doc => doc.data());
            const totalInquiries = inquiries.length;
            if (totalInquiries === 0) {
                continue;
            }
            const respondedInquiries = inquiries.filter(inquiry => inquiry.status !== 'new' && inquiry.status !== 'expired').length;
            const responseRate = Math.round((respondedInquiries / totalInquiries) * 100);
            // Calculate average response time for responded inquiries
            const responseTimes = inquiries
                .filter(inquiry => inquiry.responses && inquiry.responses.length > 0)
                .map(inquiry => {
                const firstResponse = inquiry.responses.find(r => r.fromVendor);
                if (firstResponse) {
                    const inquiryTime = inquiry.createdAt.toDate().getTime();
                    const responseTime = firstResponse.createdAt.toDate().getTime();
                    return (responseTime - inquiryTime) / (1000 * 60 * 60); // hours
                }
                return null;
            })
                .filter(time => time !== null);
            const avgResponseTime = responseTimes.length > 0
                ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
                : 0;
            batch.update(vendorDoc.ref, {
                'stats.responseRate': responseRate,
                'stats.responseTime': avgResponseTime,
                updatedAt: (0, firebase_1.serverTimestamp)()
            });
            updateCount++;
        }
        if (updateCount > 0) {
            await batch.commit();
            console.log(`Updated response rates for ${updateCount} vendors`);
        }
    }
    catch (error) {
        console.error('Error updating vendor response rates:', error);
    }
}
exports.default = scheduledCleanup;
//# sourceMappingURL=scheduledCleanup.js.map