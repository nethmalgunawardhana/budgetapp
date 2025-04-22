import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { createSavingsPlan, getCurrentSavingsPlan, deleteSavingsPlan, updateSavingsPlan } from '../../services/savingsPlanService';

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
  spendingHistory: { date: string; amount: number }[];
}

export default function SavingsPlanTab() {
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingPlan, setCreatingPlan] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<SavingsPlanData | null>(null);
  const [fixedIncome, setFixedIncome] = useState<string>('');
  const [fixedCosts, setFixedCosts] = useState<string>('');
  const [savingsPercentage, setSavingsPercentage] = useState<number>(25);
  const [showNewPlan, setShowNewPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      setLoading(true);
      const plan = await getCurrentSavingsPlan();
      setCurrentPlan(plan);
      setError(null);
    } catch (err) {
      setError('Failed to load savings plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!fixedIncome || !fixedCosts) {
      Alert.alert('Error', 'Please enter both fixed income and fixed costs');
      return;
    }

    const incomeValue = parseFloat(fixedIncome);
    const costsValue = parseFloat(fixedCosts);

    if (isNaN(incomeValue) || isNaN(costsValue)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    if (costsValue >= incomeValue) {
      Alert.alert('Error', 'Fixed costs should be less than income');
      return;
    }

    try {
      setCreatingPlan(true);
      const date = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
      const planData = {
        month: monthNames[date.getMonth()],
        year: date.getFullYear().toString(),
        fixedIncome: incomeValue,
        fixedCosts: costsValue,
        savingsPercentage: savingsPercentage
      };
      
      const result = await createSavingsPlan(planData);
      setCurrentPlan(result);
      setShowNewPlan(false);
      setFixedIncome('');
      setFixedCosts('');
      setError(null);
    } catch (err) {
      setError('Failed to create savings plan');
      console.error(err);
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!currentPlan) return;
    
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this savings plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSavingsPlan(currentPlan.id);
              setCurrentPlan(null);
              setError(null);
            } catch (err) {
              setError('Failed to delete savings plan');
              console.error(err);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleUpdatePlan = async () => {
    if (!currentPlan) return;
    setShowNewPlan(true);
    setFixedIncome(currentPlan.fixedIncome.toString());
    setFixedCosts(currentPlan.fixedCosts.toString());
    setSavingsPercentage(currentPlan.savingsPercentage);
  };

  const formatCurrency = (amount: number) => {
    return `Rs.${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {showNewPlan ? (
        <View style={styles.newPlanContainer}>
          <View style={styles.newPlanHeader}>
            <Text style={styles.newPlanTitle}>+ New plan</Text>
            <Text style={styles.newPlanSubtitle}>Enter the parameters of the month:</Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Fixed income"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={fixedIncome}
            onChangeText={setFixedIncome}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Fixed costs"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={fixedCosts}
            onChangeText={setFixedCosts}
          />
          
          <View style={styles.percentageRow}>
            <TouchableOpacity 
              style={[styles.percentageBtn, savingsPercentage === 5 && styles.activePercentageBtn]}
              onPress={() => setSavingsPercentage(5)}
            >
              <Text style={[styles.percentageText, savingsPercentage === 5 && styles.activePercentageText]}>5%</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.percentageBtn, savingsPercentage === 10 && styles.activePercentageBtn]}
              onPress={() => setSavingsPercentage(10)}
            >
              <Text style={[styles.percentageText, savingsPercentage === 10 && styles.activePercentageText]}>10%</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.percentageBtn, savingsPercentage === 15 && styles.activePercentageBtn]}
              onPress={() => setSavingsPercentage(15)}
            >
              <Text style={[styles.percentageText, savingsPercentage === 15 && styles.activePercentageText]}>15%</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.percentageBtn, savingsPercentage === 20 && styles.activePercentageBtn]}
              onPress={() => setSavingsPercentage(20)}
            >
              <Text style={[styles.percentageText, savingsPercentage === 20 && styles.activePercentageText]}>20%</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.percentageBtn, savingsPercentage === 25 && styles.activePercentageBtn]}
              onPress={() => setSavingsPercentage(25)}
            >
              <Text style={[styles.percentageText, savingsPercentage === 25 && styles.activePercentageText]}>25%</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.percentageBtn, savingsPercentage === 30 && styles.activePercentageBtn]}
              onPress={() => setSavingsPercentage(30)}
            >
              <Text style={[styles.percentageText, savingsPercentage === 30 && styles.activePercentageText]}>30%</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowNewPlan(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSavePlan}
              disabled={creatingPlan}
            >
              {creatingPlan ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : currentPlan ? (
        <View style={styles.currentPlanContainer}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.currentPlanTitle}>Current plan</Text>
              <Text style={styles.currentPlanSubtitle}>{currentPlan.month} {currentPlan.savingsPercentage}%</Text>
            </View>
            <View style={styles.planActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleDeletePlan}>
                <Ionicons name="trash-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="search-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleUpdatePlan}>
                <Ionicons name="create-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          {currentPlan.spendingHistory.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: currentPlan.spendingHistory.map(item => item.date.slice(0, 5)),
                  datasets: [
                    {
                      data: currentPlan.spendingHistory.map(item => 
                        (item.amount / currentPlan.dailySpendingLimit) * 100
                      ),
                      color: () => 'rgba(255, 215, 0, 0.8)',
                      strokeWidth: 2
                    }
                  ]
                }}
                width={Dimensions.get('window').width - 40}
                height={180}
                chartConfig={{
                  backgroundColor: '#2D2941',
                  backgroundGradientFrom: '#2D2941',
                  backgroundGradientTo: '#2D2941',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '3',
                    strokeWidth: '1',
                    stroke: '#FFD700'
                  },
                  formatYLabel: (value) => `${value}%`,
                }}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
                withHorizontalLabels={false}
                withVerticalLabels={false}
                withDots={false}
              />
              
              <View style={styles.tooltipContainer}>
                <Text style={styles.tooltipValue}>{`${Math.round(currentPlan.progress)}%`}</Text>
              </View>
              
              <View style={styles.verticalAxisLines}>
                <View style={styles.axisLine} />
                <View style={styles.axisLine} />
                <View style={styles.axisLine} />
                <View style={styles.axisLine} />
                <View style={styles.axisLine} />
              </View>
            </View>
          ) : (
            <View style={styles.emptyChartContainer}>
              <Text style={styles.emptyChartText}>No spending data yet</Text>
            </View>
          )}
          
          <View style={styles.spendingInfoContainer}>
            <Text style={styles.spendingDateText}>
              Today is {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} and you spent:
            </Text>
            <Text style={styles.spendingAmountText}>
              {formatCurrency(currentPlan.currentSpending)}
            </Text>
            
            <Text style={styles.spendingLimitText}>
              You can spend:
            </Text>
            <Text style={styles.remainingAmountText}>
              {formatCurrency(currentPlan.dailySpendingLimit - currentPlan.currentSpending)}
            </Text>
          </View>
          
          <View style={styles.planDetailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly income:</Text>
              <Text style={styles.detailValue}>{formatCurrency(currentPlan.fixedIncome)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fixed costs:</Text>
              <Text style={styles.detailValue}>{formatCurrency(currentPlan.fixedCosts)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Savings:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency((currentPlan.fixedIncome - currentPlan.fixedCosts) * (currentPlan.savingsPercentage / 100))}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Daily spending limit:</Text>
              <Text style={styles.detailValue}>{formatCurrency(currentPlan.dailySpendingLimit)}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noPlanContainer}>
          <Text style={styles.noPlanText}>No savings plan found</Text>
          <TouchableOpacity 
            style={styles.createPlanButton}
            onPress={() => setShowNewPlan(true)}
          >
            <Text style={styles.createPlanButtonText}>Create new savings plan</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!showNewPlan && !currentPlan && (
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => setShowNewPlan(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B2E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPlanContainer: {
    backgroundColor: '#2D2941',
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  newPlanHeader: {
    marginBottom: 16,
  },
  newPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  newPlanSubtitle: {
    fontSize: 14,
    color: '#AAA',
  },
  input: {
    backgroundColor: '#1E1B2E',
    color: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  percentageBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1B2E',
  },
  activePercentageBtn: {
    backgroundColor: '#FFD700',
  },
  percentageText: {
    color: '#AAA',
    fontSize: 14,
  },
  activePercentageText: {
    color: '#1E1B2E',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 165, 0, 1)',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 24,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    position: 'absolute',
    left: 0,
    bottom: 12,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
  currentPlanContainer: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  currentPlanSubtitle: {
    fontSize: 16,
    color: '#AAA',
  },
  planActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  chartContainer: {
    backgroundColor: '#2D2941',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: '#3D3951',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    top: 80,
    left: '50%',
    transform: [{ translateX: 30 }],
  },
  tooltipValue: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 14,
  },
  verticalAxisLines: {
    position: 'absolute',
    top: 16,
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyChartContainer: {
    backgroundColor: '#2D2941',
    borderRadius: 16,
    padding: 16,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyChartText: {
    color: '#888',
    fontSize: 16,
  },
  spendingInfoContainer: {
    backgroundColor: '#2D2941',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  spendingDateText: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  spendingAmountText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  spendingLimitText: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  remainingAmountText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  planDetailsContainer: {
    backgroundColor: '#2D2941',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  noPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noPlanText: {
    color: '#AAA',
    fontSize: 16,
    marginBottom: 16,
  },
  createPlanButton: {
    backgroundColor: 'rgba(255, 165, 0, 1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  createPlanButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    color: '#FF4444',
    textAlign: 'center',
    marginTop: 16,
  },
});