"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateRange = exports.validateSearch = exports.validateSort = exports.validateRateLimit = exports.validateURL = exports.validatePhone = exports.validateEmail = exports.validatePriceRange = exports.validateVendorCategory = exports.validateUUID = exports.validatePagination = exports.sanitizeInput = exports.validateImageUpload = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
// Validation error handler
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined
            }))
        });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
// File upload validation
const validateImageUpload = (req, res, next) => {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({
            success: false,
            message: 'No files uploaded'
        });
        return;
    }
    const files = Array.isArray(req.files) ? req.files : [req.files];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 10;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (files.length > maxFiles) {
        res.status(400).json({
            success: false,
            message: `Maximum ${maxFiles} files allowed`
        });
        return;
    }
    for (const file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
            res.status(400).json({
                success: false,
                message: 'Only JPEG, PNG, and WebP images are allowed'
            });
            return;
        }
        if (file.size > maxSize) {
            res.status(400).json({
                success: false,
                message: `File size must be less than ${maxSize / 1024 / 1024}MB`
            });
            return;
        }
    }
    next();
};
exports.validateImageUpload = validateImageUpload;
// Sanitize input data
const sanitizeInput = (data) => {
    if (typeof data === 'string') {
        return data.trim();
    }
    if (Array.isArray(data)) {
        return data.map(exports.sanitizeInput);
    }
    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = (0, exports.sanitizeInput)(value);
        }
        return sanitized;
    }
    return data;
};
exports.sanitizeInput = sanitizeInput;
// Pagination validation
const validatePagination = (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1) {
        res.status(400).json({
            success: false,
            message: 'Page must be a positive integer'
        });
        return;
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        res.status(400).json({
            success: false,
            message: 'Limit must be between 1 and 100'
        });
        return;
    }
    req.query.page = pageNum.toString();
    req.query.limit = limitNum.toString();
    next();
};
exports.validatePagination = validatePagination;
// Validate UUID
const validateUUID = (paramName) => {
    return (req, res, next) => {
        const uuid = req.params[paramName];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuid || !uuidRegex.test(uuid)) {
            res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`
            });
            return;
        }
        next();
    };
};
exports.validateUUID = validateUUID;
// Validate vendor category
const validateVendorCategory = (category) => {
    const validCategories = [
        'photographer', 'videographer', 'venue', 'catering', 'flowers',
        'music', 'decoration', 'dress', 'suit', 'makeup', 'hair',
        'transport', 'cake', 'jewelry', 'invitations', 'other'
    ];
    return validCategories.includes(category);
};
exports.validateVendorCategory = validateVendorCategory;
// Validate price range
const validatePriceRange = (priceRange) => {
    if (!priceRange || typeof priceRange !== 'object') {
        return false;
    }
    const { min, max, currency, unit } = priceRange;
    if (typeof min !== 'number' || min < 0) {
        return false;
    }
    if (typeof max !== 'number' || max < 0) {
        return false;
    }
    if (min > max) {
        return false;
    }
    const validCurrencies = ['CZK', 'EUR', 'USD'];
    if (!validCurrencies.includes(currency)) {
        return false;
    }
    const validUnits = ['per_event', 'per_person', 'per_hour', 'per_day', 'package'];
    if (!validUnits.includes(unit)) {
        return false;
    }
    return true;
};
exports.validatePriceRange = validatePriceRange;
// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
// Validate phone number (Czech format)
const validatePhone = (phone) => {
    const phoneRegex = /^\+420\d{9}$/;
    return phoneRegex.test(phone);
};
exports.validatePhone = validatePhone;
// Validate URL
const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.validateURL = validateURL;
// Rate limiting validation
const validateRateLimit = (maxRequests, windowMs, keyGenerator) => {
    const requests = new Map();
    return (req, res, next) => {
        const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        // Clean up old entries
        for (const [k, v] of requests.entries()) {
            if (v.resetTime < now) {
                requests.delete(k);
            }
        }
        const current = requests.get(key);
        if (!current) {
            requests.set(key, { count: 1, resetTime: now + windowMs });
            next();
            return;
        }
        if (current.count >= maxRequests) {
            res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later',
                retryAfter: Math.ceil((current.resetTime - now) / 1000)
            });
            return;
        }
        current.count++;
        next();
    };
};
exports.validateRateLimit = validateRateLimit;
// Validate sort parameters
const validateSort = (req, res, next) => {
    const { sortBy, sortOrder = 'desc' } = req.query;
    if (sortBy) {
        const validSortFields = ['name', 'createdAt', 'updatedAt', 'rating', 'price'];
        if (!validSortFields.includes(sortBy)) {
            res.status(400).json({
                success: false,
                message: 'Invalid sort field'
            });
            return;
        }
    }
    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
        res.status(400).json({
            success: false,
            message: 'Sort order must be asc or desc'
        });
        return;
    }
    next();
};
exports.validateSort = validateSort;
// Validate search query
const validateSearch = (req, res, next) => {
    const { search } = req.query;
    if (search) {
        const searchStr = search;
        if (searchStr.length < 2) {
            res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
            return;
        }
        if (searchStr.length > 100) {
            res.status(400).json({
                success: false,
                message: 'Search query must be less than 100 characters'
            });
            return;
        }
        // Sanitize search query
        req.query.search = searchStr.trim().toLowerCase();
    }
    next();
};
exports.validateSearch = validateSearch;
// Validate date range
const validateDateRange = (req, res, next) => {
    const { startDate, endDate } = req.query;
    if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            res.status(400).json({
                success: false,
                message: 'Invalid start date format'
            });
            return;
        }
    }
    if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
            res.status(400).json({
                success: false,
                message: 'Invalid end date format'
            });
            return;
        }
    }
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            res.status(400).json({
                success: false,
                message: 'Start date must be before end date'
            });
            return;
        }
    }
    next();
};
exports.validateDateRange = validateDateRange;
//# sourceMappingURL=validation.js.map