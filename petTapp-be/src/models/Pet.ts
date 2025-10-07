import mongoose, { Schema, Document } from 'mongoose';

export interface IPet extends Document {
  _id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  color?: string;
  images: {
    profileImage?: string;
    additionalImages: string[];
  };
  medicalHistory: {
    condition: string;
    diagnosedDate: Date;
    treatment?: string;
    notes?: string;
  }[];
  vaccinations: {
    vaccine: string;
    administeredDate: Date;
    nextDueDate?: Date;
    veterinarian?: string;
  }[];
  specialInstructions?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IPet>({
  ownerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  species: {
    type: String,
    required: true,
    trim: true,
    enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'guinea-pig', 'reptile', 'other']
  },
  breed: {
    type: String,
    trim: true,
    maxlength: 50
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 30
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  weight: {
    type: Number,
    min: 0,
    max: 200
  },
  color: {
    type: String,
    trim: true,
    maxlength: 30
  },
  images: {
    profileImage: {
      type: String,
      trim: true
    },
    additionalImages: [{
      type: String,
      trim: true
    }]
  },
  medicalHistory: [{
    condition: {
      type: String,
      required: true,
      trim: true
    },
    diagnosedDate: {
      type: Date,
      required: true
    },
    treatment: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  vaccinations: [{
    vaccine: {
      type: String,
      required: true,
      trim: true
    },
    administeredDate: {
      type: Date,
      required: true
    },
    nextDueDate: {
      type: Date
    },
    veterinarian: {
      type: String,
      trim: true
    }
  }],
  specialInstructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

petSchema.index({ ownerId: 1 });
petSchema.index({ species: 1 });
petSchema.index({ name: 1, ownerId: 1 });

export const Pet = mongoose.model<IPet>('Pet', petSchema);