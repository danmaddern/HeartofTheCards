import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const sessionId = localStorage.getItem('sessionId');

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (sessionId) config.headers['x-session-id'] = sessionId;

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          const newToken = data.accessToken;
          localStorage.setItem('accessToken', newToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          return api(originalRequest);
        } catch {
          processQueue(error, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          isRefreshing = false;
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) return Array.isArray(data.message) ? data.message[0] : data.message;
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const handleApiError = (error: unknown) => {
  const message = getErrorMessage(error);
  toast.error(message);
};
