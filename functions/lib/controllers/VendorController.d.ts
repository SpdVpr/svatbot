import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class VendorController {
    static getVendors(req: Request, res: Response): Promise<void>;
    static getVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getCategories(req: Request, res: Response): Promise<void>;
    static getSearchSuggestions(req: Request, res: Response): Promise<void>;
    private static trackView;
    static getVendorServices(req: Request, res: Response): Promise<void>;
    static createService(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateService(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteService(req: AuthenticatedRequest, res: Response): Promise<void>;
    static uploadImages(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteImage(req: AuthenticatedRequest, res: Response): Promise<void>;
    static reorderImages(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getVendorReviews(req: Request, res: Response): Promise<void>;
    static createReview(req: AuthenticatedRequest, res: Response): Promise<void>;
    static toggleFavorite(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMyFavorites(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createInquiry(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getVendorInquiries(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateInquiry(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=VendorController.d.ts.map