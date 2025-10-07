import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  _id: string;
  businessId: string;
  name: string;
  category: 'veterinary' | 'grooming' | 'boarding' | 'daycare' | 'training' | 'emergency' | 'consultation' | 'other';
  description: string;
  duration: number; // in minutes
  price: {
    amount: number;
    currency: string;
  };
  availability: {
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  requirements: {
    petTypes: string[];
    ageRestrictions?: {
      minAge: number;
      maxAge: number;
    };
    healthRequirements: string[];
    specialNotes?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
  businessId: {
    type: String,
    required: true,
    ref: 'Business'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['veterinary', 'grooming', 'boarding', 'daycare', 'training', 'emergency', 'consultation', 'other']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 1440 // max 24 hours
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'PHP',
      enum: ['PHP', 'USD']
    }
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      start: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      end: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }]
  },
  requirements: {
    petTypes: [{
      type: String,
      enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'guinea-pig', 'reptile', 'other']
    }],
    ageRestrictions: {
      minAge: {
        type: Number,
        min: 0
      },
      maxAge: {
        type: Number,
        max: 30
      }
    },
    healthRequirements: [{
      type: String,
      trim: true
    }],
    specialNotes: {
      type: String,
      trim: true,
      maxlength: 300
    }
  },
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

serviceSchema.index({ businessId: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ 'price.amount': 1 });
serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);