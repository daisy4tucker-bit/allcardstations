import { apiRequest } from './api';
import { User, Profile } from './authService';

export interface UserProfileResponse {
  user: User;
  profile: Profile;
}

export async function getProfile(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>('/users/profile');
}

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  country?: string | null;
  avatar?: string | null;
  preferences?: string | null;
}): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
