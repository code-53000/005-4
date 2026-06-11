import { LoginRequest, LoginResponse, TripRecord, TripRecordFormData } from '@shared/types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
    throw new Error('未授权，请重新登录');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || '请求失败');
  }

  return data as T;
}

export const api = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<LoginResponse>(response);
  },

  getRecords: async (params?: { trainNumber?: string; dateFrom?: string; dateTo?: string }): Promise<TripRecord[]> => {
    const searchParams = new URLSearchParams();
    if (params?.trainNumber) searchParams.append('trainNumber', params.trainNumber);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);

    const url = searchParams.toString()
      ? `${API_BASE}/records?${searchParams.toString()}`
      : `${API_BASE}/records`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TripRecord[]>(response);
  },

  getRecord: async (id: number): Promise<TripRecord> => {
    const response = await fetch(`${API_BASE}/records/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TripRecord>(response);
  },

  createRecord: async (formData: FormData): Promise<{ id: number; message: string }> => {
    const response = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse<{ id: number; message: string }>(response);
  },

  updateRecord: async (id: number, formData: FormData): Promise<{ id: number; message: string }> => {
    const response = await fetch(`${API_BASE}/records/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse<{ id: number; message: string }>(response);
  },

  deleteRecord: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/records/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },
};
