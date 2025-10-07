import { api } from "./config";

export interface UserProfile {
  user: {
    _id: string;
    email: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    images?: {
      profile?: string;
    };
  };
  profile: {
    _id: string;
    userId: string;
    contactNumber?: string;
    profilePicture?: string;
    preferences?: {
      notifications?: {
        email?: boolean;
        sms?: boolean;
        push?: boolean;
      };
      location?: {
        allowLocationAccess?: boolean;
        defaultSearchRadius?: number;
      };
    };
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ProfileUpdateRequest {
  user?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    email?: string;
  };
  profile?: {
    contactNumber?: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/users/profile");
  return response.data.data;
};

export const updateProfile = async (data: ProfileUpdateRequest): Promise<UserProfile> => {
  const response = await api.put("/users/profile", data);
  return response.data.data;
};

export const deleteAccount = async (): Promise<void> => {
  await api.delete("/users/account");
};

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await api.post("/auth/change-password", data);
};

export const updateNotificationPreferences = async (
  notifications: NotificationPreferences
): Promise<UserProfile> => {
  const response = await api.patch("/users/notifications", { notifications });
  return response.data.data;
};

export const uploadProfilePicture = async (file: File): Promise<{ url: string; path: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post("/api/files/users/profile", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};
