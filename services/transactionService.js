import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.8.101:5000/api/transactions';

export const transactionService = {
  // Add a new transaction
  async addTransaction(transactionData) {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}/add`, transactionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Fetch transactions with optional filters
  async getTransactions(params = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/list`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },

  // Fetch transaction summary
  async getTransactionSummary() {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Get categories
  async getCategories() {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // Add a new category
  async addCategory(categoryData) {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}/categories/add`, categoryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};