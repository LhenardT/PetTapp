import { Request } from 'express';
import { Document } from 'mongoose';

export enum UserRole {
  PET_OWNER = 'pet-owner',
  BUSINESS_OWNER = 'business-owner',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  role: UserRole;
  isActive: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  tokens: AuthTokens;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}