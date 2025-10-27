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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminRole = exports.createVendor = exports.getVendors = exports.sendVendorContactEmails = exports.onMarketplaceVendorUpdate = exports.onMarketplaceVendorCreate = exports.checkTrialExpiry = exports.onPaymentSuccess = exports.scheduledCleanup = exports.onInquiryCreate = exports.onReviewUpdate = exports.onReviewCreate = exports.onVendorUpdate = exports.onUserCreate = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Initialize Firebase Admin
admin.initializeApp();
// Initialize Express app
const app = (0, express_1.default)();
// Trust proxy - required for Firebase Functions and rate limiting
app.set('trust proxy', true);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later'
    }
});
app.use(limiter);
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
// API routes
// Note: The Firebase Function is already named 'api', so we don't need /api prefix here
app.use('/v1/auth', authRoutes_1.default);
app.use('/v1/vendors', vendorRoutes_1.default);
app.use('/v1/admin', adminRoutes_1.default);
app.use('/v1/upload', uploadRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'svatbot-api'
    });
});
// API documentation
app.get('/v1/docs', (req, res) => {
    res.json({
        name: 'SvatBot Firebase API',
        version: '1.0.0',
        description: 'Wedding marketplace API powered by Firebase',
        endpoints: {
            auth: {
                'POST /auth/register': 'Register new user',
                'POST /auth/login': 'Login user',
                'GET /auth/profile': 'Get user profile',
                'PUT /auth/profile': 'Update user profile'
            },
            vendors: {
                'GET /vendors': 'Get vendors with filtering',
                'GET /vendors/:id': 'Get vendor by ID',
                'POST /vendors': 'Create vendor (authenticated)',
                'PUT /vendors/:id': 'Update vendor (authenticated)',
                'DELETE /vendors/:id': 'Delete vendor (authenticated)'
            },
            upload: {
                'POST /upload/images': 'Upload images to Firebase Storage',
                'DELETE /upload/images/:filename': 'Delete image from Firebase Storage'
            },
            admin: {
                'GET /admin/stats': 'Get admin statistics',
                'PUT /admin/vendors/:id/verify': 'Verify vendor',
                'PUT /admin/vendors/:id/feature': 'Feature vendor'
            }
        },
        authentication: 'Firebase Auth token in Authorization header',
        documentation: 'https://docs.svatbot.cz'
    });
});
// Error handler
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});
// Export the Express app as a Firebase Function
exports.api = functions.region('europe-west1').https.onRequest(app);
// Cloud Functions for specific operations
var onUserCreate_1 = require("./triggers/onUserCreate");
Object.defineProperty(exports, "onUserCreate", { enumerable: true, get: function () { return __importDefault(onUserCreate_1).default; } });
var onVendorUpdate_1 = require("./triggers/onVendorUpdate");
Object.defineProperty(exports, "onVendorUpdate", { enumerable: true, get: function () { return __importDefault(onVendorUpdate_1).default; } });
var onReviewCreate_1 = require("./triggers/onReviewCreate");
Object.defineProperty(exports, "onReviewCreate", { enumerable: true, get: function () { return __importDefault(onReviewCreate_1).default; } });
var onReviewUpdate_1 = require("./triggers/onReviewUpdate");
Object.defineProperty(exports, "onReviewUpdate", { enumerable: true, get: function () { return __importDefault(onReviewUpdate_1).default; } });
var onInquiryCreate_1 = require("./triggers/onInquiryCreate");
Object.defineProperty(exports, "onInquiryCreate", { enumerable: true, get: function () { return __importDefault(onInquiryCreate_1).default; } });
var scheduledCleanup_1 = require("./triggers/scheduledCleanup");
Object.defineProperty(exports, "scheduledCleanup", { enumerable: true, get: function () { return __importDefault(scheduledCleanup_1).default; } });
// Email triggers
var onPaymentSuccess_1 = require("./triggers/onPaymentSuccess");
Object.defineProperty(exports, "onPaymentSuccess", { enumerable: true, get: function () { return __importDefault(onPaymentSuccess_1).default; } });
var checkTrialExpiry_1 = require("./triggers/checkTrialExpiry");
Object.defineProperty(exports, "checkTrialExpiry", { enumerable: true, get: function () { return __importDefault(checkTrialExpiry_1).default; } });
// Marketplace vendor triggers
var onMarketplaceVendorCreate_1 = require("./triggers/onMarketplaceVendorCreate");
Object.defineProperty(exports, "onMarketplaceVendorCreate", { enumerable: true, get: function () { return __importDefault(onMarketplaceVendorCreate_1).default; } });
var onMarketplaceVendorUpdate_1 = require("./triggers/onMarketplaceVendorUpdate");
Object.defineProperty(exports, "onMarketplaceVendorUpdate", { enumerable: true, get: function () { return __importDefault(onMarketplaceVendorUpdate_1).default; } });
// HTTPS functions
var sendVendorContactEmails_1 = require("./https/sendVendorContactEmails");
Object.defineProperty(exports, "sendVendorContactEmails", { enumerable: true, get: function () { return sendVendorContactEmails_1.sendVendorContactEmails; } });
// Callable functions for client-side
var getVendors_1 = require("./callable/getVendors");
Object.defineProperty(exports, "getVendors", { enumerable: true, get: function () { return __importDefault(getVendors_1).default; } });
var createVendor_1 = require("./callable/createVendor");
Object.defineProperty(exports, "createVendor", { enumerable: true, get: function () { return __importDefault(createVendor_1).default; } });
// export { default as updateVendor } from './callable/updateVendor'
// export { default as deleteVendor } from './callable/deleteVendor'
// export { default as uploadImages } from './callable/uploadImages'
// export { default as sendInquiry } from './callable/sendInquiry'
// export { default as addReview } from './callable/addReview'
// export { default as toggleFavorite } from './callable/toggleFavorite'
// Admin setup function (one-time use)
var setAdminRole_1 = require("./setAdminRole");
Object.defineProperty(exports, "setAdminRole", { enumerable: true, get: function () { return setAdminRole_1.setAdminRole; } });
//# sourceMappingURL=index.js.map