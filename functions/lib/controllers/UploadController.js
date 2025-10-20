"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const firebase_1 = require("../config/firebase");
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
class UploadController {
    // Upload multiple images
    static async uploadImages(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const files = req.files;
            if (!files || files.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
                return;
            }
            const { folder = 'svatbot', quality = 80 } = req.body;
            const uploadResults = [];
            for (const file of files) {
                try {
                    // Process image with Sharp
                    const processedBuffer = await (0, sharp_1.default)(file.buffer)
                        .resize(1920, 1080, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                        .jpeg({ quality: parseInt(quality) })
                        .toBuffer();
                    // Generate unique filename
                    const filename = `${folder}/${req.user.uid}/${(0, uuid_1.v4)()}.jpg`;
                    const fileRef = firebase_1.bucket.file(filename);
                    // Upload to Firebase Storage
                    await fileRef.save(processedBuffer, {
                        metadata: {
                            contentType: 'image/jpeg',
                            metadata: {
                                originalName: file.originalname,
                                uploadedBy: req.user.uid,
                                uploadedAt: new Date().toISOString()
                            }
                        }
                    });
                    // Make file publicly readable
                    await fileRef.makePublic();
                    // Get public URL
                    const publicUrl = `https://storage.googleapis.com/${firebase_1.bucket.name}/${filename}`;
                    uploadResults.push({
                        filename,
                        url: publicUrl,
                        size: processedBuffer.length,
                        originalName: file.originalname,
                        mimetype: 'image/jpeg'
                    });
                }
                catch (fileError) {
                    console.error(`Error processing file ${file.originalname}:`, fileError);
                    // Continue with other files
                }
            }
            if (uploadResults.length === 0) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to upload any images'
                });
                return;
            }
            res.json({
                success: true,
                message: `${uploadResults.length} images uploaded successfully`,
                data: {
                    images: uploadResults
                }
            });
        }
        catch (error) {
            console.error('Upload images error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload images'
            });
        }
    }
    // Upload single image
    static async uploadImage(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const file = req.file;
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
                return;
            }
            const { folder = 'svatbot', quality = 80, width, height } = req.body;
            // Process image with Sharp
            let sharpInstance = (0, sharp_1.default)(file.buffer);
            if (width || height) {
                sharpInstance = sharpInstance.resize(width ? parseInt(width) : undefined, height ? parseInt(height) : undefined, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }
            const processedBuffer = await sharpInstance
                .jpeg({ quality: parseInt(quality) })
                .toBuffer();
            // Generate unique filename
            const filename = `${folder}/${req.user.uid}/${(0, uuid_1.v4)()}.jpg`;
            const fileRef = firebase_1.bucket.file(filename);
            // Upload to Firebase Storage
            await fileRef.save(processedBuffer, {
                metadata: {
                    contentType: 'image/jpeg',
                    metadata: {
                        originalName: file.originalname,
                        uploadedBy: req.user.uid,
                        uploadedAt: new Date().toISOString()
                    }
                }
            });
            // Make file publicly readable
            await fileRef.makePublic();
            // Get public URL
            const publicUrl = `https://storage.googleapis.com/${firebase_1.bucket.name}/${filename}`;
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    image: {
                        filename,
                        url: publicUrl,
                        size: processedBuffer.length,
                        originalName: file.originalname,
                        mimetype: 'image/jpeg'
                    }
                }
            });
        }
        catch (error) {
            console.error('Upload image error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload image'
            });
        }
    }
    // Delete image
    static async deleteImage(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { filename } = req.params;
            // Verify user owns the file
            if (!filename.includes(req.user.uid) && req.user.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }
            const fileRef = firebase_1.bucket.file(filename);
            // Check if file exists
            const [exists] = await fileRef.exists();
            if (!exists) {
                res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
                return;
            }
            // Delete file
            await fileRef.delete();
            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete image error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete image'
            });
        }
    }
    // Get image info
    static async getImageInfo(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { filename } = req.params;
            const fileRef = firebase_1.bucket.file(filename);
            // Check if file exists
            const [exists] = await fileRef.exists();
            if (!exists) {
                res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
                return;
            }
            // Get file metadata
            const [metadata] = await fileRef.getMetadata();
            res.json({
                success: true,
                data: {
                    image: {
                        filename,
                        size: metadata.size,
                        contentType: metadata.contentType,
                        created: metadata.timeCreated,
                        updated: metadata.updated,
                        metadata: metadata.metadata
                    }
                }
            });
        }
        catch (error) {
            console.error('Get image info error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get image info'
            });
        }
    }
    // Generate optimized URL
    static async getOptimizedUrl(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { filename, width, height, quality = 80 } = req.body;
            if (!filename) {
                res.status(400).json({
                    success: false,
                    message: 'Filename is required'
                });
                return;
            }
            // For Firebase Storage, we would need to implement image transformation
            // This is a simplified version - in production you might use a service like ImageKit
            const baseUrl = `https://storage.googleapis.com/${firebase_1.bucket.name}/${filename}`;
            // Generate different sizes
            const sizes = {
                thumbnail: `${baseUrl}?w=300&h=300&q=${quality}`,
                medium: `${baseUrl}?w=800&h=600&q=${quality}`,
                large: `${baseUrl}?w=1200&h=900&q=${quality}`,
                original: baseUrl
            };
            if (width && height) {
                sizes.custom = `${baseUrl}?w=${width}&h=${height}&q=${quality}`;
            }
            res.json({
                success: true,
                data: {
                    urls: sizes
                }
            });
        }
        catch (error) {
            console.error('Get optimized URL error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate optimized URL'
            });
        }
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=UploadController.js.map