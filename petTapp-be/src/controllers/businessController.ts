import { Response, NextFunction } from 'express';
import { Business } from '../models/Business';
import { AuthRequest, UserRole } from '../types/auth.types';
import { imageService } from '../services/imageService';

export const createBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessData = {
      ...req.body,
      ownerId: req.user?.userId
    };

    const business = new Business(businessData);
    await business.save();

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: business
    });
  } catch (error) {
    next(error);
  }
};

export const getBusinesses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      businessType,
      city,
      isVerified,
      search
    } = req.query;

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let filter: any = { isActive: true };

    // If user is a business owner, only show their own businesses
    if (userRole === UserRole.BUSINESS_OWNER) {
      filter.ownerId = userId;
    }
    // If user is pet owner or public, only show verified businesses
    // DEVELOPMENT: Set SKIP_BUSINESS_VERIFICATION=true to bypass verification check
    else if (userRole === UserRole.PET_OWNER || !userRole) {
      if (process.env.SKIP_BUSINESS_VERIFICATION !== 'true') {
        filter.isVerified = true;
      }
    }
    // Admins can see all businesses

    if (businessType) {
      filter.businessType = businessType;
    }

    if (city) {
      filter['address.city'] = new RegExp(city as string, 'i');
    }

    // Allow explicit isVerified filter for admins
    if (isVerified !== undefined && userRole === UserRole.ADMIN) {
      filter.isVerified = isVerified === 'true';
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    const businesses = await Business.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Business.countDocuments(filter);

    // Attach images to all businesses
    const businessesWithImages = await imageService.attachBusinessImagesArray(businesses.map(business => business.toObject()));

    res.json({
      success: true,
      data: businessesWithImages,
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

export const getBusinessById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Business owner can only see their own businesses
    if (userRole === UserRole.BUSINESS_OWNER && business.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Pet owners and public can only see verified and active businesses
    // DEVELOPMENT: Set SKIP_BUSINESS_VERIFICATION=true to bypass verification check
    if ((userRole === UserRole.PET_OWNER || !userRole) && !business.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if ((userRole === UserRole.PET_OWNER || !userRole) &&
        process.env.SKIP_BUSINESS_VERIFICATION !== 'true' &&
        !business.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Attach images to the business
    const businessWithImages = await imageService.attachBusinessImages(business.toObject());

    res.json({
      success: true,
      data: businessWithImages
    });
  } catch (error) {
    next(error);
  }
};

export const updateBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (req.user?.role === UserRole.BUSINESS_OWNER && business.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Business updated successfully',
      data: updatedBusiness
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (req.user?.role === UserRole.BUSINESS_OWNER && business.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Business.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const business = await Business.findByIdAndUpdate(
      id,
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

export const searchBusinesses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10,
      businessType,
      page = 1,
      limit = 10
    } = req.query;

    let filter: any = { isActive: true, isVerified: true };

    if (businessType) {
      filter.businessType = businessType;
    }

    let query = Business.find(filter);

    if (latitude && longitude) {
      query = Business.find({
        ...filter,
        'address.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: Number(radius) * 1000 // Convert km to meters
          }
        }
      });
    }

    const businesses = await query
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ 'ratings.averageRating': -1 });

    // Attach images to all businesses
    const businessesWithImages = await imageService.attachBusinessImagesArray(businesses.map(business => business.toObject()));

    res.json({
      success: true,
      data: businessesWithImages
    });
  } catch (error) {
    next(error);
  }
};