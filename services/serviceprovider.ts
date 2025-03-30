import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = 'http://192.168.8.100:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

// Service Post Types
export interface ServicePost {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface CreateServicePostData {
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
}

// Service Post Service
export const ServicePostService = {
  // Get all posts by provider
  getServicePosts: async () => {
    const response = await apiClient.get('/service-posts/provider');
    return response.data;
  },
  
  // Get specific post
  getServicePost: async (id: string) => {
    const response = await apiClient.get(`/service-posts/${id}`);
    return response.data;
  },
  getAllServicePost:async()=>{
    const response = await apiClient.get('/service-posts/all');
    return response.data;
  },
  
  // Create new service post
  createServicePost: async (postData: CreateServicePostData) => {
    const response = await apiClient.post('/service-posts/', postData);
    return response.data;
  },
  
  // Update existing post
  updateServicePost: async (id: string, postData: Partial<CreateServicePostData>) => {
    const response = await apiClient.put(`/service-posts/${id}`, postData);
    return response.data;
  },
  
  // Delete service post
  deleteServicePost: async (id: string) => {
    const response = await apiClient.delete(`/service-posts/${id}`);
    return response.data;
  },
   
  // Toggle service post status (active/inactive)
  toggleServiceStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await apiClient.patch(`/service-posts/${id}/status`, { status });
    return response.data;
  },
  
};

