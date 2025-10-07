import { Response, NextFunction } from 'express';
import { Service } from '../models/Service';
import { Business } from '../models/Business';
import { AuthRequest, UserRole } from '../types/auth.types';
import { fileService } from '../services/file';

export const createService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    const userId = req.user?.userId;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (req.user?.role === UserRole.BUSINESS_OWNER && business.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only create services for your own business'
      });
    }

    const service = new Service(req.body);
    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      businessId,
      category,
      search,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      radius
    } = req.query;

    let filter: any = { isActive: true };

    if (businessId) {
      filter.businessId = businessId;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }

    // Location-based filtering (if latitude, longitude, and radius are provided)
    if (latitude && longitude && radius) {
      const lat = Number(latitude);
      const lon = Number(longitude);
      const radiusInKm = Number(radius);

      // Convert radius from kilometers to degrees (approximate)
      // 1 degree latitude = ~111 km
      // 1 degree longitude = ~111 km * cos(latitude)
      const latDegrees = radiusInKm / 111;
      const lonDegrees = radiusInKm / (111 * Math.cos(lat * Math.PI / 180));

      // Ensure location exists and is within the radius
      filter['location'] = { $exists: true, $ne: null };
      filter['location.latitude'] = {
        $gte: lat - latDegrees,
        $lte: lat + latDegrees
      };
      filter['location.longitude'] = {
        $gte: lon - lonDegrees,
        $lte: lon + lonDegrees
      };
    }

    const services = await Service.find(filter)
      .populate('businessId', 'businessName businessType address ratings ownerId')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(filter);

    // Get images for each service
    const servicesWithImages = await Promise.all(
      services.map(async (service) => {
        const serviceObj = service.toObject();

        // Get service images
        const business = service.businessId as any;
        const userId = business?.ownerId || '';

        const filesResult = await fileService.listEntityFiles({
          userId,
          entityType: 'service',
          entityId: service._id.toString()
        });

        const imageUrl = filesResult.success && filesResult.files && filesResult.files.length > 0
          ? filesResult.files[0].url
          : null;

        return {
          ...serviceObj,
          imageUrl
        };
      })
    );

    res.json({
      success: true,
      data: servicesWithImages,
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

export const getServiceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .populate('businessId', 'businessName businessType address ratings contactInfo businessHours ownerId');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const serviceObj = service.toObject();

    // Get service images
    const business = service.businessId as any;
    const userId = business?.ownerId || '';

    const filesResult = await fileService.listEntityFiles({
      userId,
      entityType: 'service',
      entityId: service._id.toString()
    });

    const imageUrl = filesResult.success && filesResult.files && filesResult.files.length > 0
      ? filesResult.files[0].url
      : null;

    res.json({
      success: true,
      data: {
        ...serviceObj,
        imageUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const service = await Service.findById(id).populate('businessId');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const business = service.businessId as any;
    if (req.user?.role === UserRole.BUSINESS_OWNER && business.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const service = await Service.findById(id).populate('businessId');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const business = service.businessId as any;
    if (req.user?.role === UserRole.BUSINESS_OWNER && business.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Service.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getServicesByBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const services = await Service.find({ businessId, isActive: true })
      .populate('businessId', 'ownerId')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments({ businessId, isActive: true });

    // Get images for each service
    const servicesWithImages = await Promise.all(
      services.map(async (service) => {
        const serviceObj = service.toObject();

        // Get service images
        const filesResult = await fileService.listEntityFiles({
          userId: (service.businessId as any).ownerId || '',
          entityType: 'service',
          entityId: service._id.toString()
        });

        const imageUrl = filesResult.success && filesResult.files && filesResult.files.length > 0
          ? filesResult.files[0].url
          : null;

        return {
          ...serviceObj,
          imageUrl
        };
      })
    );

    res.json({
      success: true,
      data: servicesWithImages,
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

export const getServiceCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = [
      'veterinary',
      'grooming',
      'boarding',
      'daycare',
      'training',
      'emergency',
      'consultation',
      'other'
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};