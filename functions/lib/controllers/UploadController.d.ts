import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class UploadController {
    static uploadImages(req: AuthenticatedRequest, res: Response): Promise<void>;
    static uploadImage(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteImage(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getImageInfo(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getOptimizedUrl(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=UploadController.d.ts.map