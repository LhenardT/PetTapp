import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Business } from '../models/Business';
import { Booking } from '../models/Booking';
import { Pet } from '../models/Pet';
import { Service } from '../models/Service';
import { AuthRequest, UserRole } from '../types/auth.types';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalBusinesses,
      totalBookings,
      totalPets,
      totalServices,
      pendingBookings,
      unverifiedBusinesses,
      completedBookings
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Business.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Pet.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: 'pending' }),
      Business.countDocuments({ isVerified: false, isActive: true }),
      Booking.countDocuments({ status: 'completed' })
    ]);

    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const businessesByType = await Business.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$businessType', count: { $sum: 1 } } }
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('petOwnerId', 'firstName lastName email')
      .populate('businessId', 'businessName')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBusinesses,
          totalBookings,
          totalPets,
          totalServices,
          pendingBookings,
          unverifiedBusinesses,
          completedBookings
        },
        analytics: {
          usersByRole,
          businessesByType,
          bookingsByStatus
        },
        recentActivity: {
          recentBookings
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search
    } = req.query;

    let filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { firstName: new RegExp(search as string, 'i') },
        { lastName: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password -refreshTokens')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === UserRole.ADMIN) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndUpdate(userId, { isActive: false });

    if (user.role === UserRole.BUSINESS_OWNER) {
      await Business.updateMany({ ownerId: userId }, { isActive: false });
    }

    if (user.role === UserRole.PET_OWNER) {
      await Pet.updateMany({ ownerId: userId }, { isActive: false });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingBusinesses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const businesses = await Business.find({ isVerified: false, isActive: true })
      .populate('ownerId', 'firstName lastName email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Business.countDocuments({ isVerified: false, isActive: true });

    res.json({
      success: true,
      data: businesses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findByIdAndUpdate(
      businessId,
      { isVerified: true },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.json({
      success: true,
      message: 'Business verified successfully',
      data: business
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    const [
      newUsersCount,
      newBusinessesCount,
      newBookingsCount,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(dateFilter),
      Business.countDocuments(dateFilter),
      Booking.countDocuments(dateFilter),
      Booking.aggregate([
        { $match: { status: 'completed', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$totalAmount.amount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        newUsers: newUsersCount,
        newBusinesses: newBusinessesCount,
        newBookings: newBookingsCount,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};