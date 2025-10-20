import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email: string;
        role: UserRole;
        verified: boolean;
        customClaims?: any;
    };
}
export declare const verifyToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireSuperAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireVendorOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireVerifiedEmail: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireVendorOwnership: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const setUserRole: (uid: string, role: UserRole) => Promise<void>;
export declare const getUserByEmail: (email: string) => Promise<import("firebase-admin/auth").UserRecord>;
export declare const createUser: (userData: {
    email: string;
    password: string;
    displayName?: string;
    emailVerified?: boolean;
}) => Promise<import("firebase-admin/auth").UserRecord>;
export declare const updateUser: (uid: string, userData: any) => Promise<import("firebase-admin/auth").UserRecord>;
export declare const deleteUser: (uid: string) => Promise<void>;
export declare const generateCustomToken: (uid: string, additionalClaims?: any) => Promise<string>;
export declare const revokeRefreshTokens: (uid: string) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map