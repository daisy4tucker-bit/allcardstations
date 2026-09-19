const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?:
    | {
        message: string;
        statusCode?: number;
      }
    | string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    localStorage.getItem('allcardstatus_token') ||
    localStorage.getItem('allcardvault_token') ||
    localStorage.getItem('allcardstation_token');

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

  const responseText = await response.text();
  let data: ApiResponse<T>;

  try {
    data = JSON.parse(responseText);
  } catch {
    if (!response.ok) {
      throw new Error(`Server request failed with status ${response.status} (${response.statusText || 'Error'}).`);
    }
    // If received HTML or invalid JSON on 200 OK
    throw new Error('Server returned an unexpected non-JSON response format.');
  }

  if (!response.ok || data.success === false) {
    const errorMsg =
      (typeof data.error === 'string' ? data.error : data.error?.message) ||
      data.message ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return (data.data !== undefined ? data.data : data) as T;
}
