import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategorySelector from './categorypopup';
import { transactionService } from '../../services/transactionService';

interface CategoryItem {
  id?: string;
  name: string;
  icon: string;
  color: string;
}

interface TransactionFormProps {
  isVisible: boolean;
  onClose: () => void;
  selectedCategory?: CategoryItem;
  onSubmitSuccess?: () => Promise<void>;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isVisible,
  onClose,
  selectedCategory: initialCategory,
  onSubmitSuccess
}) => {
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Physical Cash');
  const [loading, setLoading] = useState(false);
  
  // New state for category selector
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | undefined>(initialCategory);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  
  // Custom date picker state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  
  // For date picker modal
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState('12:00');
  const [tempAmPm, setTempAmPm] = useState('PM');
  
  const formattedTime = selectedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  
  const formattedDateTime = `${formattedTime} | ${formattedDate}`;
  
  // Reset form when it becomes visible
  useEffect(() => {
    if (isVisible) {
      setTransactionType('EXPENSE');
      setAmount('');
      setDescription('');
      setPaymentMethod('Physical Cash');
      setSelectedCategory(initialCategory);
      setSelectedDate(new Date());
    }
  }, [isVisible, initialCategory]);
  
  // Initialize temp date and time when opening the date modal
  useEffect(() => {
    if (showDateModal) {
      setTempDate(selectedDate);
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      setTempTime(`${formattedHours}:${minutes}`);
      setTempAmPm(ampm);
    }
  }, [showDateModal]);

  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      
      const transactionData = {
        type: transactionType,
        category: selectedCategory.name,
        amount: parseFloat(amount),
        description,
        paymentMethod,
        date: selectedDate.toISOString(),
      };
      
      await transactionService.addTransaction(transactionData);
      
      // Reset form fields
      setAmount('');
      setDescription('');
      
      // Notify parent component of successful submission
      if (onSubmitSuccess) {
        await onSubmitSuccess();
      } else {
        onClose();
      }
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: CategoryItem) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);
  };
  
  const applyDateTimeSelection = () => {
    const [hourStr, minuteStr] = tempTime.split(':');
    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);
    
    // Convert 12h to 24h format
    if (tempAmPm === 'PM' && hours < 12) {
      hours += 12;
    } else if (tempAmPm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const newDate = new Date(tempDate);
    newDate.setHours(hours, minutes);
    
    setSelectedDate(newDate);
    setShowDateModal(false);
  };
  
  // Generate date options for picker
  const dateOptions = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    dateOptions.push({
      date: new Date(date),
      label: `${month} ${day}, ${year}`
    });
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Transaction</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Transaction Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'INCOME' && styles.selectedTypeButton,
                  { backgroundColor: transactionType === 'INCOME' ? '#4CD97B' : undefined }
                ]}
                onPress={() => setTransactionType('INCOME')}
              >
                <Text style={styles.typeButtonText}>INCOME</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'EXPENSE' && styles.selectedTypeButton,
                  { backgroundColor: transactionType === 'EXPENSE' ? '#FF5253' : undefined }
                ]}
                onPress={() => setTransactionType('EXPENSE')}
              >
                <Text style={styles.typeButtonText}>EXPENSE</Text>
              </TouchableOpacity>
            </View>

            {/* Transaction Date/Time Selector */}
            <TouchableOpacity 
              style={styles.formField}
              onPress={() => setShowDateModal(true)}
            >
              <Text style={styles.fieldLabel}>TRANSACTION DATE</Text>
              <View style={styles.dropdownContainer}>
                <Text style={styles.fieldValue}>{formattedDateTime}</Text>
                <TouchableOpacity style={styles.dropdownIcon}>
                  <Ionicons name="calendar-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.fieldUnderline} />
            </TouchableOpacity>

            {/* Category Field with Dropdown */}
            <TouchableOpacity 
              style={styles.formField} 
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <View style={styles.dropdownContainer}>
                {selectedCategory ? (
                  <View style={styles.selectedCategoryRow}>
                    <View style={[styles.categoryIconSmall, { backgroundColor: selectedCategory.color }]}>
                      <Text style={styles.categoryIcon}>{selectedCategory.icon}</Text>
                    </View>
                    <Text style={styles.fieldValue}>{selectedCategory.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.fieldValue}>Select Category</Text>
                )}
                <TouchableOpacity style={styles.dropdownIcon}>
                  <Ionicons name="chevron-down" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.fieldUnderline} />
            </TouchableOpacity>

            {/* Amount Field */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>AMOUNT</Text>
              <TextInput
                style={styles.fieldValue}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#9E9EA7"
              />
              <View style={styles.fieldUnderline} />
            </View>

            {/* Currency Field */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>CURRENCY</Text>
              <Text style={styles.fieldValue}>Rupees (Rs.)</Text>
              <View style={styles.fieldUnderline} />
            </View>

            {/* Payment Method */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>PAYMENT METHOD</Text>
              <View style={styles.paymentMethodContainer}>
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === 'Physical Cash' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setPaymentMethod('Physical Cash')}
                >
                  <Text style={styles.paymentMethodText}>Cash</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === 'Credit Card' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setPaymentMethod('Credit Card')}
                >
                  <Text style={styles.paymentMethodText}>Card</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === 'Bank Transfer' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setPaymentMethod('Bank Transfer')}
                >
                  <Text style={styles.paymentMethodText}>Bank</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fieldUnderline} />
            </View>

            {/* Description Field */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <TextInput
                style={styles.fieldValue}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a note"
                placeholderTextColor="#9E9EA7"
              />
              <View style={styles.fieldUnderline} />
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Transaction</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Custom Date Time Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDateModal}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateTimeModalContent}>
            <Text style={styles.modalTitle}>Select Date and Time</Text>
            
            {/* Date Selection */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Date:</Text>
              <ScrollView 
                style={styles.dateScroller}
                showsVerticalScrollIndicator={true}
              >
                {dateOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      tempDate.toDateString() === option.date.toDateString() && styles.selectedDateOption
                    ]}
                    onPress={() => setTempDate(option.date)}
                  >
                    <Text 
                      style={[
                        styles.dateOptionText,
                        tempDate.toDateString() === option.date.toDateString() && styles.selectedDateOptionText
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Time Selection */}
            <View style={styles.timePickerContainer}>
              <Text style={styles.timePickerLabel}>Time:</Text>
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={styles.timeInput}
                  value={tempTime}
                  onChangeText={(text) => {
                    // Basic validation for time format (e.g., 12:30)
                    if (/^([1-9]|1[0-2]):([0-5][0-9])$/.test(text) || /^([1-9]|1[0-2]):([0-5])?$/.test(text) || /^([1-9]|1[0-2])?$/.test(text)) {
                      setTempTime(text);
                    }
                  }}
                  placeholder="12:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <View style={styles.amPmSelector}>
                  <TouchableOpacity
                    style={[
                      styles.amPmOption,
                      tempAmPm === 'AM' && styles.selectedAmPm
                    ]}
                    onPress={() => setTempAmPm('AM')}
                  >
                    <Text style={[
                      styles.amPmText,
                      tempAmPm === 'AM' && styles.selectedAmPmText
                    ]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.amPmOption,
                      tempAmPm === 'PM' && styles.selectedAmPm
                    ]}
                    onPress={() => setTempAmPm('PM')}
                  >
                    <Text style={[
                      styles.amPmText,
                      tempAmPm === 'PM' && styles.selectedAmPmText
                    ]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyDateTimeSelection}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selector Modal */}
      <CategorySelector 
        isVisible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onCategorySelect={handleCategorySelect}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191932',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#2A2A3C',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  selectedTypeButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  typeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formField: {
    marginBottom: 25,
    position: 'relative',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#9E9EA7',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: 'white',
    paddingBottom: 10,
  },
  fieldUnderline: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 0,
    bottom: 10,
  },
  saveButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryIcon: {
    color: 'white',
    fontSize: 16,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  paymentMethodOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2A2A3C',
    marginRight: 10,
  },
  selectedPaymentMethod: {
    backgroundColor: '#FF5733',
  },
  paymentMethodText: {
    color: 'white',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeModalContent: {
    width: '90%',
    backgroundColor: '#242444',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  datePickerLabel: {
    color: '#9E9EA7',
    fontSize: 14,
    marginBottom: 8,
  },
  dateScroller: {
    maxHeight: 200,
    backgroundColor: '#1E1E38',
    borderRadius: 8,
  },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedDateOption: {
    backgroundColor: 'rgba(255, 87, 51, 0.2)',
  },
  dateOptionText: {
    color: 'white',
    fontSize: 16,
  },
  selectedDateOptionText: {
    color: '#FF5733',
    fontWeight: 'bold',
  },
  timePickerContainer: {
    marginBottom: 20,
  },
  timePickerLabel: {
    color: '#9E9EA7',
    fontSize: 14,
    marginBottom: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#1E1E38',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  amPmSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E1E38',
    borderRadius: 8,
    overflow: 'hidden',
  },
  amPmOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedAmPm: {
    backgroundColor: '#FF5733',
  },
  amPmText: {
    color: 'white',
    fontSize: 16,
  },
  selectedAmPmText: {
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#2A2A3C',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FF5733',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TransactionForm;