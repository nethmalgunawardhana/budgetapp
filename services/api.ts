import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
const BASE_URL = 'http://192.168.8.100:5000/api';

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

// Define user types for better type checking
type UserRegisterData = {
  name: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

type ServiceProviderRegisterData = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  serviceType: string;
};

export const AuthService = {
  // Regular user authentication methods
  async register(data: UserRegisterData) {
    try {
      const response = await api.post('/auth/register', data);
      
      // Store tokens
      await AsyncStorage.setItem('accessToken', response.data.tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      await AsyncStorage.setItem('userType', 'user');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async login(data: LoginData) {
    try {
      const response = await api.post('/auth/login', data);
      
      // Store tokens
      await AsyncStorage.setItem('accessToken', response.data.tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      await AsyncStorage.setItem('userType', 'user');
      
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
      await AsyncStorage.setItem('userType', 'user');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Service provider authentication methods
  async serviceProviderSignUp(data: ServiceProviderRegisterData) {
    try {
      const response = await api.post('/auth/service-provider/register', data);
      
      // Don't store tokens yet as service providers might need approval
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async serviceProviderLogin(data: LoginData) {
    try {
      const response = await api.post('/auth/service-provider/login', data);
      
      // Store tokens
      await AsyncStorage.setItem('accessToken', response.data.tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      await AsyncStorage.setItem('userType', 'serviceProvider');
      await AsyncStorage.setItem('serviceType', response.data.serviceType);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getServiceProviderProfile() {
    try {
      const response = await api.get('/service-providers/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateServiceProviderProfile(data: {
    businessName?: string;
    description?: string;
    serviceAreas?: string[];
    availability?: object;
    rates?: object;
    skills?: string[];
  }) {
    try {
      const response = await api.put('/service-providers/profile', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async uploadServiceProviderDocuments(formData: FormData) {
    try {
      const response = await api.post('/service-providers/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Common authentication methods
  async logout() {
    try {
      const userType = await AsyncStorage.getItem('userType');
      // Optional: Call backend logout endpoint if needed
      if (userType === 'serviceProvider') {
        await api.post('/auth/service-provider/logout');
      } else {
        await api.post('/auth/logout');
      }
      
      // Clear all auth-related storage
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('serviceType');
    } catch (error) {
      // Still clear tokens even if API call fails
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('serviceType');
      throw error;
    }
  },

  async refreshAccessToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userType = await AsyncStorage.getItem('userType');
      
      let endpoint = '/auth/refresh-token';
      if (userType === 'serviceProvider') {
        endpoint = '/auth/service-provider/refresh-token';
      }
      
      const response = await api.post(endpoint, { refreshToken });
      
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      
      return response.data.accessToken;
    } catch (error) {
      // Logout user if refresh fails
      await this.logout();
      throw error;
    }
  },

  // Check user authentication status and type
  async checkAuthStatus() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userType = await AsyncStorage.getItem('userType');
      
      if (!token) return { isAuthenticated: false };
      
      return { 
        isAuthenticated: true, 
        userType: userType || 'user'
      };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }
};

// Service provider specific services
export const ServiceProviderService = {
  async getJobs() {
    try {
      const response = await api.get('/service-providers/jobs');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getJobById(jobId: string) {
    try {
      const response = await api.get(`/service-providers/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async acceptJob(jobId: string) {
    try {
      const response = await api.post(`/service-providers/jobs/${jobId}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async declineJob(jobId: string, reason: string) {
    try {
      const response = await api.post(`/service-providers/jobs/${jobId}/decline`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async completeJob(jobId: string, notes: string) {
    try {
      const response = await api.post(`/service-providers/jobs/${jobId}/complete`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async updateAvailability(availability: object) {
    try {
      const response = await api.put('/service-providers/availability', { availability });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getDashboardStats() {
    try {
      const response = await api.get('/service-providers/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;