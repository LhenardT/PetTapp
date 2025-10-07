import { api } from "./config";

export interface Service {
  _id: string;
  businessId: string;
  name: string;
  category: string;
  description: string;
  duration: number;
  price: {
    amount: number;
    currency: string;
  };
  availability: {
    days: string[];
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  requirements: {
    petTypes: string[];
    ageRestrictions?: {
      minAge?: number;
      maxAge?: number;
    };
    healthRequirements?: string[];
    specialNotes?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  business?: {
    _id: string;
    name: string;
    contactInfo?: {
      address?: string;
      phone?: string;
    };
  };
}

export interface ServicesParams {
  page?: number;
  limit?: number;
  businessId?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface ServicesResponse {
  success: boolean;
  data: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getServices = async (params?: ServicesParams): Promise<ServicesResponse> => {
  const response = await api.get("/services", { params });
  return response.data;
};

export const getServiceById = async (id: string): Promise<Service> => {
  const response = await api.get(`/services/${id}`);
  return response.data.data;
};

export const getServicesByBusiness = async (
  businessId: string,
  params?: { page?: number; limit?: number }
): Promise<ServicesResponse> => {
  const response = await api.get(`/services/business/${businessId}`, { params });
  return response.data;
};

export const getServiceCategories = async (): Promise<string[]> => {
  const response = await api.get("/services/categories");
  return response.data.data;
};
