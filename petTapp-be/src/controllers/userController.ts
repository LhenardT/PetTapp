import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { AuthRequest, UserRole } from '../types/auth.types';
import { imageService } from '../services/imageService';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      userProfile = new UserProfile({ userId });
      await userProfile.save();
    }

    // Attach user images (profile picture)
    const userWithImages = await imageService.attachUserImages(user.toObject());

    res.json({
      success: true,
      data: {
        user: userWithImages,
        profile: userProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { user: userData, profile: profileData } = req.body;

    let updatedUser;
    if (userData) {
      const { password, role, refreshTokens, ...allowedUserData } = userData;
      updatedUser = await User.findByIdAndUpdate(
        userId,
        allowedUserData,
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');
    }

    let updatedProfile;
    if (profileData) {
      // Remove profilePicture from allowed updates - use separate upload endpoint
      const { profilePicture, ...allowedProfileData } = profileData;
      updatedProfile = await UserProfile.findOneAndUpdate(
        { userId },
        allowedProfileData,
        { new: true, upsert: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        profile: updatedProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    await User.findByIdAndUpdate(userId, { isActive: false });
    await UserProfile.findOneAndUpdate({ userId }, { isActive: false });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { notifications } = req.body;

    const userProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { 'preferences.notifications': notifications },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocationPreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { location } = req.body;

    const userProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { 'preferences.location': location },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Location preferences updated successfully',
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
};

export const updateLastLogin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    await UserProfile.findOneAndUpdate(
      { userId },
      { lastLoginAt: new Date() },
      { upsert: true }
    );

    next();
  } catch (error) {
    next();
  }
};