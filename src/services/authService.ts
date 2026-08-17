import { apiRequest } from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CUSTOMER' | 'SUPPORT_AGENT' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  phone?: string | null;
  country?: string | null;
  avatar?: string | null;
  preferences?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getMe(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/auth/me');
}
