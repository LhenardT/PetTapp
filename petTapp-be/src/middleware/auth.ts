import { Response, NextFunction } from 'express';
import { verifyToken, getTokenFromHeader } from '../utils/jwt';
import { createError } from './errorHandler';
import { AuthRequest, UserRole } from '../types/auth.types';
import { User } from '../models/User';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for token in cookies first (for web), then in Authorization header (for mobile)
    const cookieToken = req.cookies?.accessToken;
    const headerToken = getTokenFromHeader(req.headers.authorization);
    const token = cookieToken || headerToken;

    if (!token) {
      throw createError('Access token required', 401);
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw createError('User not found or inactive', 401);
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message || 'Invalid or expired token',
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first',
      });
      return;
    }

    if (roles.length === 0) {
      next();
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required role: ${roles.join(' or ')}, current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for token in cookies first (for web), then in Authorization header (for mobile)
    const cookieToken = req.cookies?.accessToken;
    const headerToken = getTokenFromHeader(req.headers.authorization);
    const token = cookieToken || headerToken;

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      }
    }

    next();
  } catch {
    next();
  }
};