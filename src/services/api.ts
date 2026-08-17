const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('allcardstation_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: {
      message: 'Failed to parse server response.',
      statusCode: response.status,
    },
  }));

  if (!response.ok || data.success === false) {
    const errorMsg =
      data.error?.message || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return (data.data !== undefined ? data.data : data) as T;
}
