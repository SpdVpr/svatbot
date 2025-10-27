import * as admin from 'firebase-admin';
export declare const auth: import("firebase-admin/auth").Auth;
export declare const firestore: admin.firestore.Firestore;
export declare const storage: import("firebase-admin/lib/storage/storage").Storage;
export declare const messaging: import("firebase-admin/lib/messaging/messaging").Messaging;
export declare const collections: {
    users: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    vendors: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    services: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    reviews: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    inquiries: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    favorites: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    analytics: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    notifications: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    adminLogs: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    vendorReviews: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    marketplaceVendors: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
};
export declare const bucket: import("@google-cloud/storage").Bucket;
export declare const FieldValue: typeof FirebaseFirestore.FieldValue;
export declare const Timestamp: typeof FirebaseFirestore.Timestamp;
export declare const createBatch: () => admin.firestore.WriteBatch;
export declare const runTransaction: (updateFunction: (transaction: admin.firestore.Transaction) => Promise<any>) => Promise<any>;
export declare const serverTimestamp: () => admin.firestore.FieldValue;
export declare const arrayUnion: (...elements: any[]) => admin.firestore.FieldValue;
export declare const arrayRemove: (...elements: any[]) => admin.firestore.FieldValue;
export declare const increment: (n: number) => admin.firestore.FieldValue;
export declare const deleteField: () => admin.firestore.FieldValue;
export declare const createConverter: <T>() => {
    toFirestore: (data: T) => admin.firestore.DocumentData;
    fromFirestore: (snapshot: admin.firestore.QueryDocumentSnapshot, options: admin.firestore.SnapshotOptions) => T;
};
export declare class FirebaseError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
}
export declare const ErrorCodes: {
    UNAUTHORIZED: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    ALREADY_EXISTS: string;
    INVALID_ARGUMENT: string;
    PERMISSION_DENIED: string;
    UNAUTHENTICATED: string;
};
export declare const validateAuth: (context: any) => any;
export declare const validateAdmin: (context: any) => any;
export declare const validateVendor: (context: any) => any;
export declare const logActivity: (userId: string, action: string, details?: any, collection?: string) => Promise<void>;
export declare const paginate: <T>(query: admin.firestore.Query<T>, limit?: number, startAfter?: admin.firestore.DocumentSnapshot) => Promise<{
    docs: ({
        id: string;
    } & T)[];
    lastDoc: admin.firestore.QueryDocumentSnapshot<T>;
    hasMore: boolean;
}>;
export declare const searchDocuments: (collectionName: string, searchFields: string[], searchTerm: string, limit?: number) => Promise<any[]>;
//# sourceMappingURL=firebase.d.ts.map