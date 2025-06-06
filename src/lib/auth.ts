import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  role: 'customer' | 'producer';
  profile?: any;
}

export const login = async (email: string, password: string, role?: 'customer' | 'producer') => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password, role });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};

export const register = async (email: string, password: string, role: 'customer' | 'producer', profileData: any) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      role,
      profileData
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed';
    throw new Error(message);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getProfile = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await axios.get(`${API_URL}/auth/profile`);
    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error: any) {
    // If token is invalid, clear it
    if (error.response?.status === 401) {
      logout();
    }
    throw new Error(error.response?.data?.message || 'Failed to get profile');
  }
};

export const validateSession = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await axios.get(`${API_URL}/auth/verify`);
    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error: any) {
    // If token is invalid, clear it
    logout();
    return null;
  }
};

// Add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      logout();
      // Redirect to home page instead of /login since we use modals
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);