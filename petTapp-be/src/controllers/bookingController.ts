import { Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { Pet } from '../models/Pet';
import { Business } from '../models/Business';
import { AuthRequest, UserRole } from '../types/auth.types';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { serviceId, petId, appointmentDateTime } = req.body;
    const petOwnerId = req.user?.userId;

    const service = await Service.findById(serviceId).populate('businessId');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.ownerId !== petOwnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only book services for your own pets'
      });
    }

    const existingBooking = await Booking.findOne({
      serviceId,
      appointmentDateTime: new Date(appointmentDateTime),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already booked'
      });
    }

    const business = service.businessId as any;
    const bookingData = {
      petOwnerId,
      businessId: business._id,
      serviceId,
      petId,
      appointmentDateTime: new Date(appointmentDateTime),
      duration: service.duration,
      totalAmount: service.price,
      ...req.body
    };

    const booking = new Booking(bookingData);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('serviceId', 'name category duration price')
      .populate('petId', 'name species age')
      .populate('businessId', 'businessName address contactInfo');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      businessId,
      petOwnerId
    } = req.query;

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let filter: any = {};

    if (userRole === UserRole.PET_OWNER) {
      filter.petOwnerId = userId;
    } else if (userRole === UserRole.BUSINESS_OWNER) {
      if (businessId) {
        const business = await Business.findOne({ _id: businessId, ownerId: userId });
        if (!business) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
        filter.businessId = businessId;
      } else {
        const userBusinesses = await Business.find({ ownerId: userId }).select('_id');
        filter.businessId = { $in: userBusinesses.map(b => b._id) };
      }
    } else if (userRole === UserRole.ADMIN) {
      if (petOwnerId) filter.petOwnerId = petOwnerId;
      if (businessId) filter.businessId = businessId;
    }

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('serviceId', 'name category duration price')
      .populate('petId', 'name species age')
      .populate('businessId', 'businessName address contactInfo')
      .populate('petOwnerId', 'firstName lastName email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ appointmentDateTime: -1 });

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
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

export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const booking = await Booking.findById(id)
      .populate('serviceId', 'name category duration price')
      .populate('petId', 'name species age')
      .populate('businessId', 'businessName address contactInfo')
      .populate('petOwnerId', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (userRole === UserRole.PET_OWNER && booking.petOwnerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === UserRole.BUSINESS_OWNER) {
      const business = await Business.findOne({ _id: booking.businessId, ownerId: userId });
      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (userRole === UserRole.PET_OWNER) {
      if (booking.petOwnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      if (!['cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Pet owners can only cancel bookings'
        });
      }
    } else if (userRole === UserRole.BUSINESS_OWNER) {
      const business = await Business.findOne({ _id: booking.businessId, ownerId: userId });
      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const updateData: any = { status };
    if (status === 'cancelled' && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('serviceId petId businessId petOwnerId');

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

export const addBookingRating = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { score, review } = req.body;
    const userId = req.user?.userId;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.petOwnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        rating: {
          score,
          review,
          reviewDate: new Date()
        }
      },
      { new: true }
    );

    const business = await Business.findById(booking.businessId);
    if (business) {
      const allRatings = await Booking.find({
        businessId: booking.businessId,
        'rating.score': { $exists: true }
      }).select('rating.score');

      const totalRatings = allRatings.length;
      const averageRating = allRatings.reduce((sum, b) => sum + b.rating!.score, 0) / totalRatings;

      await Business.findByIdAndUpdate(booking.businessId, {
        'ratings.averageRating': Math.round(averageRating * 10) / 10,
        'ratings.totalReviews': totalRatings
      });
    }

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};