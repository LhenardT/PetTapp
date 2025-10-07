import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  _id: string;
  userId: string;
  contactNumber?: string;
  profilePicture?: string;
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    location: {
      allowLocationAccess: boolean;
      defaultSearchRadius: number; // in kilometers
    };
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  contactNumber: {
    type: String,
    trim: true,
    match: [/^(\+63|0)[0-9]{10}$/, 'Please enter a valid Philippine phone number']
  },
  profilePicture: {
    type: String,
    trim: true
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    location: {
      allowLocationAccess: {
        type: Boolean,
        default: false
      },
      defaultSearchRadius: {
        type: Number,
        default: 10,
        min: 1,
        max: 100
      }
    }
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

userProfileSchema.index({ userId: 1 });

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);