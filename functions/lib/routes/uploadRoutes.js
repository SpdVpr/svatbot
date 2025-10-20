"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UploadController_1 = require("../controllers/UploadController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
        }
    }
});
// Upload multiple images
router.post('/images', auth_1.verifyToken, upload.array('images', 10), validation_1.validateImageUpload, UploadController_1.UploadController.uploadImages);
// Upload single image
router.post('/image', auth_1.verifyToken, upload.single('image'), validation_1.validateImageUpload, UploadController_1.UploadController.uploadImage);
// Delete image
router.delete('/images/:filename', auth_1.verifyToken, UploadController_1.UploadController.deleteImage);
// Get image info
router.get('/images/:filename/info', auth_1.verifyToken, UploadController_1.UploadController.getImageInfo);
// Generate optimized URL
router.post('/images/optimize', auth_1.verifyToken, UploadController_1.UploadController.getOptimizedUrl);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map