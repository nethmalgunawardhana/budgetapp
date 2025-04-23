import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavingsPlanData {
  id: string;
  month: string;
  year: string;
  fixedIncome: number;
  fixedCosts: number;
  savingsPercentage: number;
  currentSpending: number;
  dailySpendingLimit: number;
  progress: number;
  spendingHistory: { date: string; amount: number; category: string }[];
}

interface CreateSavingsPlanRequest {
  month: string;
  year: string;
  fixedIncome: number;
  fixedCosts: number;
  savingsPercentage: number;
}

interface TransactionRequest {
  amount: number;
  category: string;
  description?: string;
  type: 'EXPENSE' | 'INCOME';
  paymentMethod?: string;
}

interface DailySpendingData {
  dailySpending: {
    date: string;
    totalAmount: number;
    transactions: Transaction[];
  }[];
  statistics: {
    totalTransactions: number;
    totalSpending: number;
    dateRange: {
      from: string;
      to: string;
    };
  };
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  type: 'EXPENSE' | 'INCOME';
  paymentMethod: string;
  createdAt: string;
}

interface CategorySpendingData {
  categorySpending: {
    category: string;
    totalAmount: number;
    transactionCount: number;
    transactions: Transaction[];
  }[];
  totalCategories: number;
  totalTransactions: number;
  totalSpending: number;
}

const API_BASE_URL = 'http://192.168.8.101:5000';

/**
 * Get authorization headers with the access token
 */
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Fetches the current active savings plan
 */
export const getCurrentSavingsPlan = async (): Promise<SavingsPlanData | null> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/savings/current`, authHeaders);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // No plan found is not an error, just return null
      return null;
    }
    console.error('Error fetching current savings plan:', error);
    throw new Error('Failed to fetch current savings plan');
  }
};

/**
 * Creates a new savings plan
 */
export const createSavingsPlan = async (data: CreateSavingsPlanRequest): Promise<SavingsPlanData> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/api/savings`, data, authHeaders);
    return response.data.data;
  } catch (error) {
    console.error('Error creating savings plan:', error);
    throw new Error('Failed to create savings plan');
  }
};

/**
 * Updates an existing savings plan
 */
export const updateSavingsPlan = async (id: string, data: Partial<CreateSavingsPlanRequest>): Promise<SavingsPlanData> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.put(`${API_BASE_URL}/api/savings/${id}`, data, authHeaders);
    return response.data.data;
  } catch (error) {
    console.error('Error updating savings plan:', error);
    throw new Error('Failed to update savings plan');
  }
};

/**
 * Deletes a savings plan
 */
export const deleteSavingsPlan = async (id: string): Promise<void> => {
  try {
    const authHeaders = await getAuthHeaders();
    await axios.delete(`${API_BASE_URL}/api/savings/${id}`, authHeaders);
  } catch (error) {
    console.error('Error deleting savings plan:', error);
    throw new Error('Failed to delete savings plan');
  }
};

/**
 * Get savings plan history
 */
export const getSavingsPlanHistory = async (): Promise<SavingsPlanData[]> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/savings/history`, authHeaders);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching savings plan history:', error);
    throw new Error('Failed to fetch savings plan history');
  }
};

/**
 * Create a new transaction (expense or income)
 */
export const createTransaction = async (transactionData: TransactionRequest): Promise<Transaction> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/api/savings/transactions`, transactionData, authHeaders);
    return response.data.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
};

/**
 * Get daily transactions
 */
export const getDailyTransactions = async (): Promise<DailySpendingData> => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/savings/transactions/daily`, authHeaders);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching daily transactions:', error);
    throw new Error('Failed to fetch daily transactions');
  }
};

/**
 * Get transactions by category
 */
export const getCategoryTransactions = async (
  startDate?: string, 
  endDate?: string
): Promise<CategorySpendingData> => {
  try {
    const authHeaders = await getAuthHeaders();
    let url = `${API_BASE_URL}/api/savings/transactions/category`;
    
    // Add query parameters if provided
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      url += `?${params.toString()}`;
    }
    
    const response = await axios.get(url, authHeaders);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching category transactions:', error);
    throw new Error('Failed to fetch category transactions');
  }
};