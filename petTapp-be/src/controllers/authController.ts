import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import {
  AuthRequest,
  RegisterRequestBody,
  LoginRequestBody,
  RefreshTokenRequestBody,
  UserRole,
  AuthResponse,
  UserProfile
} from '../types/auth.types';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least 1 number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character');

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
  role: z.enum([UserRole.PET_OWNER, UserRole.BUSINESS_OWNER, UserRole.ADMIN])
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema
});

export class AuthController {
  static async register(req: Request<{}, AuthResponse, RegisterRequestBody>, res: Response<AuthResponse>, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);

      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        res.status(409).json({
          message: 'User already exists with this email',
          user: {} as AuthResponse['user'],
          tokens: {} as AuthResponse['tokens']
        });
        return;
      }

      const user = new User(validatedData);
      await user.save();

      const tokens = generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      const refreshCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      const accessCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: 24 * 60 * 60 * 1000 // 1 day (same as token expiry)
      };

      res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
      res.cookie('accessToken', tokens.accessToken, accessCookieOptions);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        tokens
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request<{}, AuthResponse, LoginRequestBody>, res: Response<AuthResponse>, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await User.findOne({ email: validatedData.email, isActive: true });
      if (!user) {
        res.status(401).json({
          message: 'Invalid credentials',
          user: {} as AuthResponse['user'],
          tokens: {} as AuthResponse['tokens']
        });
        return;
      }

      const isPasswordValid = await user.comparePassword(validatedData.password);
      if (!isPasswordValid) {
        res.status(401).json({
          message: 'Invalid credentials',
          user: {} as AuthResponse['user'],
          tokens: {} as AuthResponse['tokens']
        });
        return;
      }

      const tokens = generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      const refreshCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      const accessCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: 24 * 60 * 60 * 1000 // 1 day (same as token expiry)
      };

      res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
      res.cookie('accessToken', tokens.accessToken, accessCookieOptions);

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        tokens
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request<{}, { accessToken: string }, RefreshTokenRequestBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token not provided' });
        return;
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findOne({
        _id: decoded.userId,
        refreshTokens: refreshToken,
        isActive: true
      });

      if (!user) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
      }

      const tokens = generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      const refreshCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      const accessCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: 24 * 60 * 60 * 1000 // 1 day (same as token expiry)
      };

      res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
      res.cookie('accessToken', tokens.accessToken, accessCookieOptions);

      res.status(200).json({
        accessToken: tokens.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthRequest, res: Response<{ user: UserProfile }>, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) {
        res.status(404).json({ user: {} as UserProfile });
        return;
      }

      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken && req.user?.userId) {
        const user = await User.findById(req.user.userId);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
          await user.save();
        }
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const
      });

      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const
      });

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.userId) {
        const user = await User.findById(req.user.userId);
        if (user) {
          user.refreshTokens = [];
          await user.save();
        }
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const
      });

      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const
      });

      res.status(200).json({ message: 'Logged out from all devices' });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = changePasswordSchema.parse(req.body);

      const user = await User.findById(req.user?.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const isCurrentPasswordValid = await user.comparePassword(validatedData.currentPassword);
      if (!isCurrentPasswordValid) {
        res.status(401).json({ message: 'Current password is incorrect' });
        return;
      }

      user.password = validatedData.newPassword;
      await user.save();

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
}