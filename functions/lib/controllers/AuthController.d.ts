import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    static getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    static changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
    static verifyEmail(req: Request, res: Response): Promise<void>;
    static sendVerificationEmail(req: AuthenticatedRequest, res: Response): Promise<void>;
    static sendPasswordReset(req: Request, res: Response): Promise<void>;
    static confirmPasswordReset(req: Request, res: Response): Promise<void>;
    static logout(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void>;
    static setUserRole(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map