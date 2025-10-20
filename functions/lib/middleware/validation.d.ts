import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateImageUpload: (req: Request, res: Response, next: NextFunction) => void;
export declare const sanitizeInput: (data: any) => any;
export declare const validatePagination: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUUID: (paramName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateVendorCategory: (category: string) => boolean;
export declare const validatePriceRange: (priceRange: any) => boolean;
export declare const validateEmail: (email: string) => boolean;
export declare const validatePhone: (phone: string) => boolean;
export declare const validateURL: (url: string) => boolean;
export declare const validateRateLimit: (maxRequests: number, windowMs: number, keyGenerator?: (req: Request) => string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateSort: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateSearch: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateDateRange: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map