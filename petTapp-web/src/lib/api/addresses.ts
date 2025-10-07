import { api } from "./config";

export interface Address {
  _id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressFormData {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const getAddresses = async () => {
  const response = await api.get("/addresses");
  return response.data.data as Address[];
};

export const getAddressById = async (id: string) => {
  const response = await api.get(`/addresses/${id}`);
  return response.data.data as Address;
};

export const createAddress = async (data: AddressFormData) => {
  const response = await api.post("/addresses", data);
  return response.data.data as Address;
};

export const updateAddress = async (id: string, data: Partial<AddressFormData>) => {
  const response = await api.put(`/addresses/${id}`, data);
  return response.data.data as Address;
};

export const deleteAddress = async (id: string) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

export const setDefaultAddress = async (id: string) => {
  const response = await api.patch(`/addresses/${id}/set-default`);
  return response.data.data as Address;
};
