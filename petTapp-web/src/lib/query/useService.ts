import { useQuery } from "@tanstack/react-query";
import * as serviceApi from "../api/services";
import type { ServicesParams } from "../api/services";

export const useGetServices = (params?: ServicesParams) => {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => serviceApi.getServices(params),
  });
};

export const useGetServiceById = (id: string) => {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => serviceApi.getServiceById(id),
    enabled: !!id,
  });
};

export const useGetServicesByBusiness = (
  businessId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ["services", "business", businessId, params],
    queryFn: () => serviceApi.getServicesByBusiness(businessId, params),
    enabled: !!businessId,
  });
};

export const useGetServiceCategories = () => {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: serviceApi.getServiceCategories,
  });
};
