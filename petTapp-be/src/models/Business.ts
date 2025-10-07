import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  _id: string;
  ownerId: string;
  businessName: string;
  businessType: 'veterinary' | 'grooming' | 'boarding' | 'daycare' | 'training' | 'pet-shop' | 'other';
  description?: string;
  images: {
    logo?: string;
    businessImages: string[];
  };
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  credentials: {
    licenseNumber?: string;
    certifications: string[];
    insuranceInfo?: string;
  };
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>({
  ownerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  businessType: {
    type: String,
    required: true,
    enum: ['veterinary', 'grooming', 'boarding', 'daycare', 'training', 'pet-shop', 'other']
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  images: {
    logo: {
      type: String,
      trim: true
    },
    businessImages: [{
      type: String,
      trim: true
    }]
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Philippines'
    },
    coordinates: {
      type: new Schema({
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }, { _id: false }),
      required: false
    }
  },
  businessHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: false }
    }
  },
  credentials: {
    licenseNumber: {
      type: String,
      trim: true
    },
    certifications: [{
      type: String,
      trim: true
    }],
    insuranceInfo: {
      type: String,
      trim: true
    }
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  autoIndex: false
});

businessSchema.index({ ownerId: 1 });
businessSchema.index({ businessType: 1 });
businessSchema.index({ 'address.city': 1 });
businessSchema.index({ businessName: 'text', description: 'text' });
// Only index if coordinates exist and are valid
businessSchema.index(
  { 'address.coordinates': '2dsphere' },
  { sparse: true }
);

// Middleware to clean up empty or invalid coordinates before save
businessSchema.pre('save', function(next) {
  if (this.address?.coordinates) {
    const coords = this.address.coordinates.coordinates;
    // If coordinates array is empty or invalid, remove the entire coordinates object
    if (!coords || coords.length !== 2 || !coords.every((c: number) => typeof c === 'number')) {
      this.address.coordinates = undefined;
    }
  }
  next();
});

// Middleware for findOneAndUpdate
businessSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update?.address?.coordinates) {
    const coords = update.address.coordinates.coordinates;
    if (!coords || coords.length !== 2 || !coords.every((c: number) => typeof c === 'number')) {
      if (update.$set) {
        delete update.$set['address.coordinates'];
      }
      delete update.address.coordinates;
    }
  }
  next();
});

export const Business = mongoose.model<IBusiness>('Business', businessSchema);