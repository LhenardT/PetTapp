import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPets, getPetById, createPet, updatePet, deletePet, uploadPetProfile } from "../api/pets";
import type { Pet } from "@/types/pets";

export const useGetPets = () => {
  return useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });
};

export const useGetPetById = (id: string) => {
  return useQuery({
    queryKey: ["pet", id],
    queryFn: () => getPetById(id),
  });
};

export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ petData, profileImage }: { petData: Pet; profileImage?: File }) =>
      createPet(petData, profileImage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
};

export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Pet) => updatePet(data._id!, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["pet", variables._id] });
    },
  });
};

export const useDeletePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
};

export const useUploadPetProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ petId, file }: { petId: string; file: File }) =>
      uploadPetProfile(petId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["pet", variables.petId] });
    },
  });
};