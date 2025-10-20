import * as functions from 'firebase-functions';
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
export declare const setAdminRole: functions.HttpsFunction & functions.Runnable<any>;
//# sourceMappingURL=setAdminRole.d.ts.map