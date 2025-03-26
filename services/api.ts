// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
const BASE_URL = 'http://192.168.8.101:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const AuthService = {
  async register(data: { name: string; email: string; password: string }) {
    try {
      const response = await api.post('/auth/register', data);
      
      // Store tokens
      await AsyncStorage.setItem('accessToken', response.data.tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async login(data: { email: string; password: string }) {
    try {
      const response = await api.post('/auth/login', data);
      
      // Store tokens
      await AsyncStorage.setItem('accessToken', response.data.tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async googleSignIn(token: string) {
    try {
      const response = await api.post('/auth/google-signin', { token });
      
      // Store tokens
      await AsyncStorage.setItem('accessToken', response.data.tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      // Optional: Call backend logout endpoint if needed
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      throw error;
    }
  },

  async refreshAccessToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      
      return response.data.accessToken;
    } catch (error) {
      // Logout user if refresh fails
      await this.logout();
      throw error;
    }
  }
};

export default api;