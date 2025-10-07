import { api } from "./config";
import type { Pet } from "@/types/pets";

export const getPets = async () => {
  const response = await api.get("/pets");
  return response.data.data;
};

export const getPetById = async (id: string) => {
  const response = await api.get(`/pets/${id}`);
  return response.data.data;
};

export const createPet = async (data: Pet, profileImage?: File) => {
  // If there's an image, use multipart/form-data
  if (profileImage) {
    const formData = new FormData();
    formData.append('petData', JSON.stringify(data));
    formData.append('image', profileImage);

    const response = await api.post("/pets", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Otherwise, use regular JSON
  const response = await api.post("/pets", data);
  return response.data.data;
};

export const updatePet = async (id: string, data: Pet) => {
  const response = await api.put(`/pets/${id}`, data);
  return response.data.data;
};

export const deletePet = async (id: string) => {
  const response = await api.delete(`/pets/${id}`);
  return response.data.data;
};

export const uploadPetProfile = async (petId: string, file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/api/files/pets/${petId}/profile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
