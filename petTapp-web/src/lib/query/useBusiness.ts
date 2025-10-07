import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBusinesses,
  getBusinessById,
  searchBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from "../api/businesses";
import type {
  BusinessInput,
  GetBusinessesParams,
  SearchBusinessParams,
} from "@/types/business";

export const useGetBusinesses = (params?: GetBusinessesParams) => {
  return useQuery({
    queryKey: ["businesses", params],
    queryFn: () => getBusinesses(params),
  });
};

export const useSearchBusinesses = (params: SearchBusinessParams) => {
  return useQuery({
    queryKey: ["businesses", "search", params],
    queryFn: () => searchBusinesses(params),
    enabled: !!(params.latitude && params.longitude),
  });
};

export const useGetBusinessById = (id: string) => {
  return useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessById(id),
    enabled: !!id,
  });
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BusinessInput) => createBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BusinessInput }) =>
      updateBusiness(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", variables.id] });
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
};
