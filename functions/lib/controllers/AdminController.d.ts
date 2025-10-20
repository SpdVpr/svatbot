import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class AdminController {
    static getStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getVendors(req: AuthenticatedRequest, res: Response): Promise<void>;
    static verifyVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static featureVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static setPremiumVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static activateVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getSystemHealth(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getVendor(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static activateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static verifyUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static changeUserRole(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getReviews(req: AuthenticatedRequest, res: Response): Promise<void>;
    static verifyReview(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteReview(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getInquiries(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getInquiry(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getSystemLogs(req: AuthenticatedRequest, res: Response): Promise<void>;
    static clearCache(req: AuthenticatedRequest, res: Response): Promise<void>;
    static testEmail(req: AuthenticatedRequest, res: Response): Promise<void>;
    static exportVendors(req: AuthenticatedRequest, res: Response): Promise<void>;
    static exportUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
    static exportAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
    static sendNotification(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AdminController.d.ts.map