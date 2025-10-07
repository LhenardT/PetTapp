import { api } from "./config";
import type {
  Business,
  BusinessInput,
  SearchBusinessParams,
  GetBusinessesParams,
  PaginationInfo,
} from "@/types/business";

export interface BusinessesResponse {
  success: boolean;
  data: Business[];
  pagination?: PaginationInfo;
}

export interface BusinessResponse {
  success: boolean;
  data: Business;
  message?: string;
}

export const searchBusinesses = async (params: SearchBusinessParams) => {
  const response = await api.get<BusinessesResponse>("/businesses/search", {
    params,
  });
  return response.data;
};

export const getBusinesses = async (params?: GetBusinessesParams) => {
  const response = await api.get<BusinessesResponse>("/businesses", {
    params,
  });
  return response.data;
};

export const getBusinessById = async (id: string) => {
  const response = await api.get<BusinessResponse>(`/businesses/${id}`);
  return response.data.data;
};

export const createBusiness = async (data: BusinessInput) => {
  const response = await api.post<BusinessResponse>("/businesses", data);
  return response.data.data;
};

export const updateBusiness = async (id: string, data: BusinessInput) => {
  const response = await api.put<BusinessResponse>(`/businesses/${id}`, data);
  return response.data.data;
};

export const deleteBusiness = async (id: string) => {
  const response = await api.delete<BusinessResponse>(`/businesses/${id}`);
  return response.data;
};
