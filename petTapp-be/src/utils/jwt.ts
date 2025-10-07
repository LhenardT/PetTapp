import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '../types/auth.types';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  [key: string]: any;
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '24h', // 1 day
    issuer: 'pettapp',
    audience: 'pettapp-users',
  });
};

export const generateRefreshToken = (payload: Pick<JWTPayload, 'userId'>): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '7d', // 7 days
    issuer: 'pettapp',
    audience: 'pettapp-users',
  });
};

export const generateTokenPair = (payload: JWTPayload): JWTTokens => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: payload.userId });

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'pettapp',
      audience: 'pettapp-users',
    });

    if (typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }

    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active');
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'pettapp',
      audience: 'pettapp-users',
    });

    if (typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }

    return decoded as { userId: string };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error('Refresh token not active');
    }
    throw error;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token);
    if (typeof decoded === 'string' || !decoded) {
      return null;
    }
    return decoded as JWTPayload;
  } catch {
    return null;
  }
};

export const getTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return null;
  }

  return token;
};