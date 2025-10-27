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
exports.searchDocuments = exports.paginate = exports.logActivity = exports.validateVendor = exports.validateAdmin = exports.validateAuth = exports.ErrorCodes = exports.FirebaseError = exports.createConverter = exports.deleteField = exports.increment = exports.arrayRemove = exports.arrayUnion = exports.serverTimestamp = exports.runTransaction = exports.createBatch = exports.Timestamp = exports.FieldValue = exports.bucket = exports.collections = exports.messaging = exports.storage = exports.firestore = exports.auth = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
// Export Firebase services
exports.auth = admin.auth();
exports.firestore = admin.firestore();
exports.storage = admin.storage();
exports.messaging = admin.messaging();
// Firestore settings
exports.firestore.settings({
    timestampsInSnapshots: true
});
// Collections references
exports.collections = {
    users: exports.firestore.collection('users'),
    vendors: exports.firestore.collection('vendors'),
    services: exports.firestore.collection('services'),
    reviews: exports.firestore.collection('reviews'),
    inquiries: exports.firestore.collection('inquiries'),
    favorites: exports.firestore.collection('favorites'),
    analytics: exports.firestore.collection('analytics'),
    notifications: exports.firestore.collection('notifications'),
    adminLogs: exports.firestore.collection('adminLogs'),
    vendorReviews: exports.firestore.collection('vendorReviews'),
    marketplaceVendors: exports.firestore.collection('marketplaceVendors')
};
// Storage bucket
exports.bucket = exports.storage.bucket();
// Helper functions
exports.FieldValue = admin.firestore.FieldValue;
exports.Timestamp = admin.firestore.Timestamp;
// Batch operations helper
const createBatch = () => exports.firestore.batch();
exports.createBatch = createBatch;
// Transaction helper
const runTransaction = (updateFunction) => {
    return exports.firestore.runTransaction(updateFunction);
};
exports.runTransaction = runTransaction;
// Server timestamp
const serverTimestamp = () => exports.FieldValue.serverTimestamp();
exports.serverTimestamp = serverTimestamp;
// Array operations
const arrayUnion = (...elements) => exports.FieldValue.arrayUnion(...elements);
exports.arrayUnion = arrayUnion;
const arrayRemove = (...elements) => exports.FieldValue.arrayRemove(...elements);
exports.arrayRemove = arrayRemove;
// Increment
const increment = (n) => exports.FieldValue.increment(n);
exports.increment = increment;
// Delete field
const deleteField = () => exports.FieldValue.delete();
exports.deleteField = deleteField;
// Firestore converters for type safety
const createConverter = () => ({
    toFirestore: (data) => {
        return data;
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return Object.assign({ id: snapshot.id }, data);
    }
});
exports.createConverter = createConverter;
// Error handling
class FirebaseError extends Error {
    constructor(code, message, statusCode = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'FirebaseError';
    }
}
exports.FirebaseError = FirebaseError;
// Common error codes
exports.ErrorCodes = {
    UNAUTHORIZED: 'auth/unauthorized',
    FORBIDDEN: 'auth/forbidden',
    NOT_FOUND: 'firestore/not-found',
    ALREADY_EXISTS: 'firestore/already-exists',
    INVALID_ARGUMENT: 'functions/invalid-argument',
    PERMISSION_DENIED: 'firestore/permission-denied',
    UNAUTHENTICATED: 'functions/unauthenticated'
};
// Validation helpers
const validateAuth = (context) => {
    if (!context.auth) {
        throw new FirebaseError(exports.ErrorCodes.UNAUTHENTICATED, 'Authentication required', 401);
    }
    return context.auth;
};
exports.validateAuth = validateAuth;
const validateAdmin = (context) => {
    const auth = (0, exports.validateAuth)(context);
    if (!auth.token.admin && !auth.token.superAdmin) {
        throw new FirebaseError(exports.ErrorCodes.FORBIDDEN, 'Admin privileges required', 403);
    }
    return auth;
};
exports.validateAdmin = validateAdmin;
const validateVendor = (context) => {
    const auth = (0, exports.validateAuth)(context);
    if (!auth.token.vendor && !auth.token.admin && !auth.token.superAdmin) {
        throw new FirebaseError(exports.ErrorCodes.FORBIDDEN, 'Vendor privileges required', 403);
    }
    return auth;
};
exports.validateVendor = validateVendor;
// Logging helper
const logActivity = async (userId, action, details = {}, collection = 'activityLogs') => {
    try {
        await exports.firestore.collection(collection).add({
            userId,
            action,
            details,
            timestamp: (0, exports.serverTimestamp)(),
            ip: details.ip || null,
            userAgent: details.userAgent || null
        });
    }
    catch (error) {
        console.error('Failed to log activity:', error);
    }
};
exports.logActivity = logActivity;
// Pagination helper
const paginate = async (query, limit = 20, startAfter) => {
    let paginatedQuery = query.limit(limit);
    if (startAfter) {
        paginatedQuery = paginatedQuery.startAfter(startAfter);
    }
    const snapshot = await paginatedQuery.get();
    const docs = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    return {
        docs,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limit
    };
};
exports.paginate = paginate;
// Search helper
const searchDocuments = async (collectionName, searchFields, searchTerm, limit = 20) => {
    const searchTermLower = searchTerm.toLowerCase();
    const promises = searchFields.map(field => {
        return exports.firestore
            .collection(collectionName)
            .where(field, '>=', searchTermLower)
            .where(field, '<=', searchTermLower + '\uf8ff')
            .limit(limit)
            .get();
    });
    const snapshots = await Promise.all(promises);
    const allDocs = new Map();
    snapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
            if (!allDocs.has(doc.id)) {
                allDocs.set(doc.id, Object.assign({ id: doc.id }, doc.data()));
            }
        });
    });
    return Array.from(allDocs.values()).slice(0, limit);
};
exports.searchDocuments = searchDocuments;
//# sourceMappingURL=firebase.js.map