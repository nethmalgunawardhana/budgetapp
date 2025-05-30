import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { fetchTransactionStats } from '../../services/transactiongraphService';
import SavingsPlanTab from '../components/savingsplan'; 

type PeriodType = 'daily' | 'monthly' | 'yearly';
type ViewModeType = 'income' | 'expense';

interface TransactionData {
  totalIncome: number;
  totalExpenses: number;
  incomeByDay: Record<string, number>;
  expenseByDay: Record<string, number>;
  dates: string[];
}

interface GraphTooltip {
  visible: boolean;
  value: number;
  x: number;
  y: number;
  date: string;
}

export default function TransactionGraphScreen() {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'statistics' | 'savings'>('statistics');
  const [viewMode, setViewMode] = useState<ViewModeType>('expense');
  const [stats, setStats] = useState<TransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<GraphTooltip>({
    visible: false,
    value: 0,
    x: 0,
    y: 0,
    date: ''
  });
  
  const scrollViewRef = useRef<ScrollView>(null);
  const horizontalScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadTransactionData();
  }, [period]);

  // Reset scroll position and clear tooltip when period or view mode changes
  useEffect(() => {
    if (horizontalScrollViewRef.current) {
      horizontalScrollViewRef.current.scrollTo({ x: 0, animated: false });
    }
    
    setTooltip({
      visible: false,
      value: 0,
      x: 0,
      y: 0,
      date: ''
    });
  }, [period, viewMode]);

  const loadTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchTransactionStats(period);
      
      // Validate the data
      if (!data || !data.dates || data.dates.length === 0) {
        throw new Error('Empty dataset received from API');
      }
      
      setStats(data);
    } catch (err) {
      console.error("Error loading transaction data:", err);
      setError('Failed to load transaction data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs.${amount.toLocaleString()}`;
  };

  const handleDataPointClick = (data: any) => {
    if (!stats) return;
    
    const { index, value, x, y } = data;
    const date = stats.dates[index] || '';
    
    setTooltip({
      visible: true,
      value,
      x,
      y,
      date
    });
    
    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setTooltip(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Calculate chart width based on the period and number of entries
  const getChartWidth = () => {
    if (!stats) return Dimensions.get('window').width - 16;
    
    const screenWidth = Dimensions.get('window').width - 16;
    
    // Calculate width based on number of data points and period type
    let dataPointWidth;
    switch (period) {
      case 'daily':
        dataPointWidth = 80;
        break;
      case 'monthly':
        dataPointWidth = 100;
        break;
      case 'yearly':
        dataPointWidth = 120;
        break;
      default:
        dataPointWidth = 80;
    }
    
    // Ensure the chart width is at least the screen width
    return Math.max(stats.dates.length * dataPointWidth, screenWidth);
  };

  // Get y-axis range based on data
  const getYAxisRange = () => {
    if (!stats) return { min: 0, max: 100000 };
    
    const values = stats.dates.map(date => 
      viewMode === 'income' 
        ? (stats.incomeByDay[date] || 0) 
        : (stats.expenseByDay[date] || 0)
    );
    
    const max = Math.max(...values);
    
    // Adjust max value to round up to a nice number based on the data range
    let adjustedMax;
    if (max < 10000) {
      adjustedMax = Math.ceil(max / 1000) * 1000;
    } else if (max < 100000) {
      adjustedMax = Math.ceil(max / 10000) * 10000;
    } else if (max < 1000000) {
      adjustedMax = Math.ceil(max / 100000) * 100000;
    } else {
      adjustedMax = Math.ceil(max / 1000000) * 1000000;
    }
    
    return { min: 0, max: adjustedMax > 0 ? adjustedMax : 10000 };
  };

  // Format y-axis label based on value size
  const formatYLabel = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  // Get chart config based on period
  const getChartConfig = () => {
    let labelRotation = 0;
    
    switch (period) {
      case 'daily':
        labelRotation = 30;
        break;
      case 'monthly':
        labelRotation = 0;
        break;
      case 'yearly':
        labelRotation = 0;
        break;
      default:
        labelRotation = 30;
    }
    
    return {
      backgroundColor: '#1E1B2E',
      backgroundGradientFrom: '#1E1B2E',
      backgroundGradientTo: '#1E1B2E',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: viewMode === 'income' ? '#FFD700' : '#FFA500'
      },
      propsForLabels: {
        fontSize: 10,
        rotation: 0,
        textAnchor: 'middle'
      },
      formatYLabel: formatYLabel,
      paddingTop: 20,
      paddingRight: 64,
      yAxisInterval: 4
    };
  };

  // Render statistics content
  const renderStatisticsContent = () => {
    return (
      <>
        {/* Period selector */}
        <View style={styles.periodContainer}>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'daily' && styles.activePeriod]} 
            onPress={() => setPeriod('daily')}
          >
            <Text style={[styles.periodText, period === 'daily' && styles.activePeriodText]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'monthly' && styles.activePeriod]} 
            onPress={() => setPeriod('monthly')}
          >
            <Text style={[styles.periodText, period === 'monthly' && styles.activePeriodText]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'yearly' && styles.activePeriod]} 
            onPress={() => setPeriod('yearly')}
          >
            <Text style={[styles.periodText, period === 'yearly' && styles.activePeriodText]}>Yearly</Text>
          </TouchableOpacity>
        </View>
        
        {/* Total amount section */}
        <View style={styles.totalsContainer}>
          <Text style={styles.totalsLabel}>
            Total {viewMode === 'income' ? 'Income' : 'Expense'}
          </Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(viewMode === 'income' ? (stats?.totalIncome || 0) : (stats?.totalExpenses || 0))}
          </Text>
        </View>
        
        {/* Income/Expense toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggle}>
            <TouchableOpacity 
              onPress={() => setViewMode('income')}
              style={[styles.toggleButton, viewMode === 'income' && styles.activeToggle]}
            >
              <Text 
                style={[
                  styles.toggleText, 
                  viewMode === 'income' ? styles.incomeToggleActive : styles.incomeToggle
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setViewMode('expense')}
              style={[styles.toggleButton, viewMode === 'expense' && styles.activeToggle]}
            >
              <Text 
                style={[
                  styles.toggleText, 
                  viewMode === 'expense' ? styles.expenseToggleActive : styles.expenseToggle
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Graph - Horizontally Scrollable */}
        {stats && (
          <View style={styles.chartOuterContainer}>
            <ScrollView
              ref={horizontalScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.horizontalScrollContent}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
              persistentScrollbar={true}
            >
              <View style={styles.chartContainer}>
                <LineChart
                  key={`${period}-${viewMode}`} // Force re-render when period or view mode changes
                  data={{
                    labels: stats.dates,
                    datasets: [
                      {
                        data: stats.dates.map(date => 
                          viewMode === 'income' 
                            ? (stats.incomeByDay[date] || 0) 
                            : (stats.expenseByDay[date] || 0)
                        ),
                        color: () => viewMode === 'income' ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 165, 0, 0.8)',
                        strokeWidth: 3
                      }
                    ]
                  }}
                  width={getChartWidth()}
                  height={240}
                  yAxisMin={getYAxisRange().min}
                  yAxisMax={getYAxisRange().max}
                  chartConfig={getChartConfig()}
                  bezier
                  withInnerLines={false}
                  withOuterLines={true}
                  withHorizontalLines={true}
                  withVerticalLines={false}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  style={styles.chart}
                  onDataPointClick={handleDataPointClick}
                  fromZero
                  yAxisLabel="Rs."
                  yAxisSuffix=""
                  verticalLabelRotation={0}
                  xLabelsOffset={period === 'daily' ? 10 : 0}
                  horizontalLabelRotation={period === 'daily' ? 30 : 0}
                  formatTopBarValue={(value) => `Rs.${value}`}
                  segments={5}
                />
                
                {tooltip.visible && (
                  <View 
                    style={[
                      styles.tooltipContainer,
                      { top: tooltip.y - 50, left: tooltip.x - 50 }
                    ]}
                  >
                    <Text style={styles.tooltipDate}>{tooltip.date}</Text>
                    <Text style={styles.tooltipValue}>{formatCurrency(tooltip.value)}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            {stats.dates.length > 3 && (
              <Text style={styles.scrollIndicator}>← Scroll to view more →</Text>
            )}
          </View>
        )}
        
        {/* Transaction Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Transaction Summary</Text>
          {stats && stats.dates.map((date, index) => (
            <View key={index} style={styles.summaryItem}>
              <Text style={styles.summaryDate}>{date}</Text>
              <Text style={[
                styles.summaryAmount, 
                viewMode === 'income' ? styles.incomeText : styles.expenseText
              ]}>
                {formatCurrency(
                  viewMode === 'income' 
                    ? (stats.incomeByDay[date] || 0) 
                    : (stats.expenseByDay[date] || 0)
                )}
              </Text>
            </View>
          ))}
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadTransactionData} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insight</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'statistics' && styles.activeTab]}
          onPress={() => setSelectedTab('statistics')}
        >
          <Text style={[styles.tabText, selectedTab === 'statistics' && styles.activeTabText]}>Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'savings' && styles.activeTab]}
          onPress={() => setSelectedTab('savings')}
        >
          <Text style={[styles.tabText, selectedTab === 'savings' && styles.activeTabText]}>Savings plan</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'statistics' ? renderStatisticsContent() : <SavingsPlanTab />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B2E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1B2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#FFA500',
    fontWeight: '600',
  },
  periodContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 12,
  },
  activePeriod: {
    backgroundColor: '#FF6B00',
  },
  periodText: {
    fontSize: 14,
    color: '#AAA',
  },
  activePeriodText: {
    color: '#FFF',
    fontWeight: '600',
  },
  totalsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  totalsLabel: {
    fontSize: 14,
    color: '#FFA500',
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  toggleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  toggle: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  toggleButton: {
    paddingBottom: 8,
    marginRight: 32,
  },
  activeToggle: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
  },
  toggleText: {
    fontSize: 16,
  },
  incomeToggle: {
    color: '#888',
  },
  incomeToggleActive: {
    color: '#FFD700',
    fontWeight: '600',
  },
  expenseToggle: {
    color: '#888',
  },
  expenseToggleActive: {
    color: '#FFA500',
    fontWeight: '600',
  },
  chartOuterContainer: {
    marginVertical: 16,
    paddingTop: 8,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
  },
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 10,
  },
  scrollIndicator: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: '#2D2941',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  tooltipDate: {
    color: '#FFF',
    fontSize: 12,
    marginBottom: 2,
  },
  tooltipValue: {
    color: '#FFA500',
    fontWeight: '600',
    fontSize: 14,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  summaryDate: {
    color: '#AAA',
    fontSize: 14,
  },
  summaryAmount: {
    fontWeight: '600',
    fontSize: 14,
  },
  incomeText: {
    color: '#FFD700',
  },
  expenseText: {
    color: '#FFA500',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  }
});