import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
interface TransactionData {
  totalIncome: number;
  totalExpenses: number;
  incomeByDay: Record<string, number>;
  expenseByDay: Record<string, number>;
  dates: string[];
}
const API_URL = 'http://192.168.8.101:5000';
// Prepare auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Fetch transaction statistics based on period
 */
export const fetchTransactionStats = async (period: 'daily' | 'monthly' | 'yearly'): Promise<TransactionData> => {
  try {
    const authHeaders = await getAuthHeaders();
    
    // Get current date range based on period
    const { startDate, endDate } = getDateRange(period);
    
    const response = await axios.get(
      `${API_URL}/api/transactions/graph?period=${period}&startDate=${startDate}&endDate=${endDate}`,
      authHeaders
    );
    
    // Process and transform data for graph
    const { incomeData, expenseData, dates } = response.data;
    
    const incomeByDay: Record<string, number> = {};
    const expenseByDay: Record<string, number> = {};
    
    dates.forEach((date: string, index: number) => {
      incomeByDay[date] = incomeData[index] || 0;
      expenseByDay[date] = expenseData[index] || 0;
    });
    
    return {
      totalIncome: response.data.totalIncome,
      totalExpenses: response.data.totalExpenses,
      incomeByDay,
      expenseByDay,
      dates,
    };
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw new Error('Failed to fetch transaction statistics');
  }
};

/**
 * Get date range based on period
 */
const getDateRange = (period: 'daily' | 'monthly' | 'yearly') => {
  const now = new Date();
  let startDate: Date;
  let endDate = now;
  
  if (period === 'daily') {
    // Last 7 days
    startDate = new Date();
    startDate.setDate(now.getDate() - 6);
  } else if (period === 'monthly') {
    // Last 30 days
    startDate = new Date();
    startDate.setDate(now.getDate() - 29);
  } else {
    // Last 12 months
    startDate = new Date();
    startDate.setMonth(now.getMonth() - 11);
  }
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
