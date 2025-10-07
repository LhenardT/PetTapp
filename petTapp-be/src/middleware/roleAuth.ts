import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types/auth.types';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requirePetOwner = requireRole([UserRole.PET_OWNER]);
export const requireBusinessOwner = requireRole([UserRole.BUSINESS_OWNER]);
export const requireAdmin = requireRole([UserRole.ADMIN]);

export const requirePetOwnerOrAdmin = requireRole([UserRole.PET_OWNER, UserRole.ADMIN]);
export const requireBusinessOwnerOrAdmin = requireRole([UserRole.BUSINESS_OWNER, UserRole.ADMIN]);
export const requireAnyRole = requireRole([UserRole.PET_OWNER, UserRole.BUSINESS_OWNER, UserRole.ADMIN]);

export const requireOwnership = (resourceIdParam: string = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.userId;

    if (resourceId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources'
      });
    }

    next();
  };
};