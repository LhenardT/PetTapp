export type BusinessType =
  | "veterinary"
  | "grooming"
  | "boarding"
  | "daycare"
  | "training"
  | "pet-shop"
  | "other";

export interface DaySchedule {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface BusinessHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Credentials {
  licenseNumber?: string;
  certifications?: string[];
  insuranceInfo?: string;
}

export interface Ratings {
  averageRating: number;
  totalReviews: number;
}

export interface BusinessImages {
  logo?: string;
  businessImages: string[];
}

export interface Business {
  _id: string;
  ownerId: string;
  businessName: string;
  businessType: BusinessType;
  description?: string;
  images?: BusinessImages;
  contactInfo: ContactInfo;
  address: Address;
  businessHours?: BusinessHours;
  credentials?: Credentials;
  ratings?: Ratings;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessInput {
  businessName: string;
  businessType: BusinessType;
  description?: string;
  contactInfo: ContactInfo;
  address: Address;
  businessHours?: BusinessHours;
  credentials?: Credentials;
}

export interface SearchBusinessParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
  businessType?: BusinessType;
  page?: number;
  limit?: number;
}

export interface GetBusinessesParams {
  page?: number;
  limit?: number;
  businessType?: BusinessType;
  city?: string;
  isVerified?: boolean;
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
