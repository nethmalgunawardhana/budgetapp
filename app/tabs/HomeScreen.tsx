import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import TransactionForm from '../components/transactionform';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { transactionService } from '../../services/transactionService';


// Define missing interfaces
interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  category: string;
  amount: number;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: Date | string;
  // Make icon and color optional since they might not come from the backend
  icon?: string;
  color?: string;
}

interface TransactionSummary {
  availableBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  categoryCount: number;
  categorySummary: CategorySummary[];
}

interface CategorySummary {
  category: string;
  amount: number;
  percentage: string;
  count: number;
  icon?: string;
  color?: string;
}

interface JWTPayload {
  name: string;
  email: string;
}

// Map of default colors and icons for categories
const DEFAULT_CATEGORY_STYLES: Record<string, { color: string, icon: string }> = {
  'Housing': { color: '#FF5733', icon: '🏠' },
  'Utilities': { color: '#33A8FF', icon: '💡' },
  'Groceries': { color: '#33FF57', icon: '🛒' },
  'Transportation': { color: '#FF33A8', icon: '🚗' },
  'Insurance': { color: '#A833FF', icon: '🔒' },
  'Debt Payments': { color: '#F3FF33', icon: '💰' },
  'Physical Cash': { color: '#33FFF3', icon: '💵' },
  'Credit Card': { color: '#FF8333', icon: '💳' },
  'Bank Transfer': { color: '#8333FF', icon: '🏦' }
};

// Default fallback values
const DEFAULT_COLOR = '#FF5733';
const DEFAULT_ICON = '💸';

const CircularProgress = ({ 
  percentage, 
  color,
  category
}: { 
  percentage: number; 
  color: string;
  category: string;
}) => {
  // Calculate the circle's circumference and the filled portion
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = ((100 - percentage) / 100) * circumference;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
      <Svg height="100" width="100" viewBox="0 0 100 100">
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#2A2A3C"
          strokeWidth="10"
          fill="transparent"
        />
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={fillPercentage}
          strokeLinecap="round"
          transform="rotate(-90, 50, 50)"
        />
      </Svg>
      <Text style={styles.categoryLabel}>{category}</Text>
    </View>
  );
};

const TransactionCard = ({ item }: { item: Transaction }) => {
  // Get color and icon for the category, using defaults if not provided
  const categoryStyle = DEFAULT_CATEGORY_STYLES[item.category] || { color: DEFAULT_COLOR, icon: DEFAULT_ICON };
  const color = item.color || categoryStyle.color;
  const icon = item.icon || categoryStyle.icon;

  return (
    <View style={styles.transactionCard}>
      <LinearGradient
        colors={['rgba(0,0,0,0)', color + '30']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.transactionGradient}
      />
      <View style={styles.transactionLeftSide}>
        <View style={[styles.categoryIcon, { backgroundColor: color }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionName}>{item.category}</Text>
          
          <Text style={styles.transactionDate}>
            {formatDate(item.createdAt || new Date())}
          </Text>
          <Text style = {styles.transactionDate}>{item.description}</Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'INCOME' ? '#4CD97B' : 'white' }
      ]}>
        {item.type === 'EXPENSE' ? '-' : '+'}Rs.{item.amount}
      </Text>
    </View>
  );
};

// Helper function to handle different date formats
const formatDate = (dateInput: Date | string | { toDate: () => Date }) => {
  let date: Date;
  
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput && typeof dateInput.toDate === 'function') {
    // Handle Firestore Timestamp
    date = dateInput.toDate();
  } else {
    // Fallback to current date if invalid
    date = new Date();
  }
  
  return date.toLocaleDateString();
};

const HomeScreen = () => {
  
  const [transactionFormVisible, setTransactionFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | undefined>(undefined);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    availableBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    transactionCount: 0,
    categoryCount: 0,
    categorySummary: []
  });
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel API calls with type-safe responses
        const [transactionsResponse, summaryResponse] = await Promise.all([
          transactionService.getTransactions({ limit: 10 }),
          transactionService.getTransactionSummary()
        ]);

        // Process transactions to ensure they have all required fields
        // Define interface for the API response items
        console.log(transactionsResponse);

        const formattedTransactions: Transaction[] = transactionsResponse.transactions.map((transaction: any) => {
          // Get default color and icon for this category if not provided
          const categoryStyle: { color: string, icon: string } = DEFAULT_CATEGORY_STYLES[transaction.category] || 
                   { color: DEFAULT_COLOR, icon: DEFAULT_ICON };
          
          return {
            ...transaction,
            // Use existing values or defaults
            color: transaction.color || categoryStyle.color,
            icon: transaction.icon || categoryStyle.icon
          };
        });

        setTransactions(formattedTransactions);
        
        // Process summary data to ensure category summaries have color and icon
        if (summaryResponse.categorySummary) {
          summaryResponse.categorySummary = summaryResponse.categorySummary.map((cat: { category: string | number; color: any; icon: any; }) => {
            const categoryStyle = DEFAULT_CATEGORY_STYLES[cat.category] || 
                                { color: DEFAULT_COLOR, icon: DEFAULT_ICON };
            
            return {
              ...cat,
              color: cat.color || categoryStyle.color,
              icon: cat.icon || categoryStyle.icon
            };
          });
        }
        
        setSummary(summaryResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Fetch user info from JWT token
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Retrieve the JWT token from AsyncStorage
        const token = await AsyncStorage.getItem('accessToken');
        
        if (token) {
          // Decode the JWT token
          const decoded = jwtDecode<JWTPayload>(token);
          
          // Set username and email
          setUsername(decoded.name || 'User');
          setEmail(decoded.email || '');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);
 
  // Check if we should show the progress bars
  const shouldShowProgressBars = summary.transactionCount > 5 && summary.categoryCount >= 3;

  // Handler for closing the transaction form
  const handleCloseTransactionForm = () => {
    setTransactionFormVisible(false);
    setSelectedCategory(undefined);
  };

  // Handler for successful transaction submission
  const handleTransactionSubmit = async () => {
    try {
      setLoading(true);
      // Refresh data after a transaction is submitted
      const [transactionsResponse, summaryResponse] = await Promise.all([
        transactionService.getTransactions({ limit: 10 }),
        transactionService.getTransactionSummary()
      ]);

      // Process transactions to add missing fields
      const formattedTransactions = transactionsResponse.transactions.map((transaction: any) => {
        // Get default color and icon for this category if not provided
        const categoryStyle = DEFAULT_CATEGORY_STYLES[transaction.category] || 
                             { color: DEFAULT_COLOR, icon: DEFAULT_ICON };
        
        return {
          ...transaction,
          // Use existing values or defaults
          color: transaction.color || categoryStyle.color,
          icon: transaction.icon || categoryStyle.icon
        };
      });

      setTransactions(formattedTransactions);
      
      // Process summary data
      if (summaryResponse.categorySummary) {
        summaryResponse.categorySummary = summaryResponse.categorySummary.map((cat: { category: string | number; color: any; icon: any; }) => {
          const categoryStyle = DEFAULT_CATEGORY_STYLES[cat.category] || 
                              { color: DEFAULT_COLOR, icon: DEFAULT_ICON };
          
          return {
            ...cat,
            color: cat.color || categoryStyle.color,
            icon: cat.icon || categoryStyle.icon
          };
        });
      }
      
      setSummary(summaryResponse);
      handleCloseTransactionForm();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     <StatusBar style="light" backgroundColor="#16213e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.headerTitle}>Hi Welcome,</Text>
          <Text style={styles.headerTitle}>{username}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5733" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              Rs.{summary.availableBalance.toLocaleString()}
            </Text>
            
            <View style={styles.incomeExpenseRow}>
              <View style={styles.incomeContainer}>
                <Text style={styles.incomeExpenseLabel}>Income</Text>
                <Text style={styles.incomeAmount}>Rs.{summary.totalIncome.toLocaleString()}</Text>
              </View>
              <View style={styles.expenseContainer}>
                <Text style={styles.incomeExpenseLabel}>Expenses</Text>
                <Text style={styles.expenseAmount}>Rs.{summary.totalExpenses.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Progress Circles - Only show when we have enough transactions and categories */}
          {shouldShowProgressBars && (
            <>
              <Text style={styles.progressTitle}>Top Spending Categories</Text>
              <View style={styles.progressSection}>
                {summary.categorySummary.slice(0, 3).map((category, index) => (
                  <CircularProgress 
                    key={index} 
                    percentage={parseFloat(category.percentage)} 
                    color={category.color || DEFAULT_COLOR}
                    category={category.category} 
                  />
                ))}
              </View>
            </>
          )}

          {/* Transactions Section */}
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionCard 
                  key={transaction.id} 
                  item={transaction} 
                />
              ))
            ) : (
              <Text style={styles.noTransactionsText}>No transactions yet</Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        isVisible={transactionFormVisible}
        onClose={handleCloseTransactionForm}
        selectedCategory={selectedCategory}
        onSubmitSuccess={handleTransactionSubmit}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setTransactionFormVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfoContainer: {
    alignItems: 'flex-start'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  userEmail: {
    fontSize: 12,
    color: '#9E9EA7',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFCC29',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  incomeContainer: {
    flex: 1,
    marginRight: 10,
  },
  expenseContainer: {
    flex: 1,
    marginLeft: 10,
  },
  incomeExpenseLabel: {
    fontSize: 14,
    color: '#9E9EA7',
    marginBottom: 5,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CD97B',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5253',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 25,
    marginLeft: 20,
    marginBottom: 10,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 120,
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryLabel: {
    color: '#9E9EA7',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 80, // Add padding at bottom to prevent FAB overlap
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  noTransactionsText: {
    color: '#9E9EA7',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A3C',
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    overflow: 'hidden',
  },
  transactionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  transactionLeftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  iconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionInfo: {
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9E9EA7',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF5733',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
});

export default HomeScreen;