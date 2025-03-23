import React, { useState } from 'react';
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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransactionFormProps {
  isVisible: boolean;
  onClose: () => void;
  selectedCategory?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isVisible,
  onClose,
  selectedCategory
}) => {
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Physical Cash');
  
  // Get current date and time
  const now = new Date();
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  
  const formattedDateTime = `${formattedTime} | ${formattedDate}`;

  const handleSave = () => {
    // Here you would save the transaction
    console.log({
      type: transactionType,
      category: selectedCategory?.name,
      amount,
      description,
      paymentMethod,
      dateTime: new Date(),
    });
    
    // Reset form and close
    setAmount('');
    setDescription('');
    onClose();
  };

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
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Transaction Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'INCOME' && styles.selectedTypeButton,
                  { backgroundColor: transactionType === 'INCOME' ? '#FF5253' : undefined }
                ]}
                onPress={() => setTransactionType('INCOME')}
              >
                <Text style={styles.typeButtonText}>INCOME</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'EXPENSE' && styles.selectedTypeButton,
                  { backgroundColor: transactionType === 'EXPENSE' ? '#FF9D42' : undefined }
                ]}
                onPress={() => setTransactionType('EXPENSE')}
              >
                <Text style={styles.typeButtonText}>EXPENSE</Text>
              </TouchableOpacity>
            </View>

            {/* Transaction Date/Time */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>TRANSACTION</Text>
              <Text style={styles.fieldValue}>{formattedDateTime}</Text>
              <View style={styles.fieldUnderline} />
            </View>

            {/* Category Field */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <Text style={styles.fieldValue}>{selectedCategory?.name || 'Select Category'}</Text>
              <View style={styles.fieldUnderline} />
              <TouchableOpacity style={styles.dropdownIcon}>
                <Ionicons name="chevron-down" size={20} color="white" />
              </TouchableOpacity>
            </View>

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
              <TouchableOpacity style={styles.dropdownIcon}>
                <Ionicons name="chevron-down" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Currency Field */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>CURRENCY</Text>
              <Text style={styles.fieldValue}>Rupees (Rs.)</Text>
              <View style={styles.fieldUnderline} />
              <TouchableOpacity style={styles.dropdownIcon}>
                <Ionicons name="chevron-down" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Payment Method */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>PAYMENT METHOD</Text>
              <Text style={styles.fieldValue}>{paymentMethod}</Text>
              <View style={styles.fieldUnderline} />
              <TouchableOpacity style={styles.dropdownIcon}>
                <Ionicons name="chevron-down" size={20} color="white" />
              </TouchableOpacity>
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
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Transaction</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  },
  typeButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTypeButton: {
    borderRadius: 4,
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
});

export default TransactionForm;