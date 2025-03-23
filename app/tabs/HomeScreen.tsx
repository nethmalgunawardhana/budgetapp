import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import CategorySelector from '../components/categorypopup';
import TransactionForm from '../components/transactionform';

interface Transaction {
  id: string;
  category: string;
  date: string;
  amount: number;
  icon: string | JSX.Element;
  color: string;
}

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const CircularProgress = ({ 
  percentage, 
  color 
}: { 
  percentage: number; 
  color: string 
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
    </View>
  );
};

const TransactionCard = ({ item }: { item: Transaction }) => {
  return (
    <View style={styles.transactionCard}>
      <LinearGradient
        colors={['rgba(0,0,0,0)', item.color + '30']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.transactionGradient}
      />
      <View style={styles.transactionLeftSide}>
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          {typeof item.icon === 'string' ? (
            <Text style={styles.iconText}>{item.icon}</Text>
          ) : (
            item.icon
          )}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionName}>{item.category}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.transactionAmount}>-Rs.{item.amount}</Text>
    </View>
  );
};

const HomeScreen = () => {
  // State to control the category selector visibility
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [transactionFormVisible, setTransactionFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | undefined>(undefined);

  // Sample data for the transactions
  const transactions: Transaction[] = [
    {
      id: '1',
      category: 'Food',
      date: 'Sep 02, 2022',
      amount: 45,
      icon: <Image source={require('../../assets/images/dinner.png')} style={styles.logoImage} />,
      color: '#FF9500',
    },
    {
      id: '2',
      category: 'Medicine',
      date: 'Sep 01, 2022',
      amount: 235,
      icon:<Image source={require('../../assets/images/medicines.png')} style={styles.logoImage} />,
      color: '#FF6B81',
    },
    {
      id: '3',
      category: 'Clothes',
      date: 'Aug 31, 2022',
      amount: 164,
      icon: <Image source={require('../../assets/images/fashion.png')} style={styles.logoImage} />,
      color: '#4CD97B',
    },
    {
      id: '4',
      category: 'Bill payments',
      date: 'Aug 31, 2022',
      amount: 399,
      icon: <Image source={require('../../assets/images/bill.png')} style={styles.logoImage} />,
      color: '#A060FA',
    },
  ];

  // Handler for category selection
  const handleCategorySelect = (category: CategoryItem) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);
    // Show the transaction form after selecting a category
    setTransactionFormVisible(true);
  };

  // Handler for closing the transaction form
  const handleCloseTransactionForm = () => {
    setTransactionFormVisible(false);
    setSelectedCategory(undefined);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>Rs.1,05,284</Text>
        </View>

        {/* Progress Circles */}
        <View style={styles.progressSection}>
          <CircularProgress percentage={13} color="#A060FA" />
          <CircularProgress percentage={61} color="#00D1E0" />
          <CircularProgress percentage={26} color="#FF9500" />
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>My transactions</Text>
          
          {transactions.map((item) => (
            <TransactionCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* Category Selector Modal */}
      <CategorySelector 
        isVisible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onCategorySelect={handleCategorySelect}
      />

      {/* Transaction Form Modal */}
      <TransactionForm
        isVisible={transactionFormVisible}
        onClose={handleCloseTransactionForm}
        selectedCategory={selectedCategory}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setCategoryModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191932',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
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
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
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
  transactionsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
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
  logoImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
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