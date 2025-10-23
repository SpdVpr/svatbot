import * as functions from 'firebase-functions';
export declare const api: functions.HttpsFunction;
export { default as onUserCreate } from './triggers/onUserCreate';
export { default as onVendorUpdate } from './triggers/onVendorUpdate';
export { default as onReviewCreate } from './triggers/onReviewCreate';
export { default as onInquiryCreate } from './triggers/onInquiryCreate';
export { default as scheduledCleanup } from './triggers/scheduledCleanup';
export { default as onPaymentSuccess } from './triggers/onPaymentSuccess';
export { default as checkTrialExpiry } from './triggers/checkTrialExpiry';
export { default as getVendors } from './callable/getVendors';
export { default as createVendor } from './callable/createVendor';
export { setAdminRole } from './setAdminRole';
//# sourceMappingURL=index.d.ts.map