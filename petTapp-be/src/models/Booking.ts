import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  _id: string;
  petOwnerId: string;
  businessId: string;
  serviceId: string;
  petId: string;
  appointmentDateTime: Date;
  duration: number; // in minutes
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  totalAmount: {
    amount: number;
    currency: string;
  };
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: 'cash' | 'gcash' | 'credit-card' | 'debit-card';
  notes?: string;
  specialRequests?: string;
  cancellationReason?: string;
  rating?: {
    score: number;
    review?: string;
    reviewDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  petOwnerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  businessId: {
    type: String,
    required: true,
    ref: 'Business'
  },
  serviceId: {
    type: String,
    required: true,
    ref: 'Service'
  },
  petId: {
    type: String,
    required: true,
    ref: 'Pet'
  },
  appointmentDateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  totalAmount: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'PHP'
    }
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'gcash', 'credit-card', 'debit-card']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 300
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: 200
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true,
      maxlength: 500
    },
    reviewDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

bookingSchema.index({ petOwnerId: 1 });
bookingSchema.index({ businessId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ petId: 1 });
bookingSchema.index({ appointmentDateTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);