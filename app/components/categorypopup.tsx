import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}

interface CategorySelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onCategorySelect: (category: CategoryItem) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  isVisible, 
  onClose,
  onCategorySelect 
}) => {
  // Sample categories data
  const categories: CategoryItem[] = [
    { id: '1', name: 'Groceries', icon: 'cart', color: '#4ECDC4' },
    { id: '2', name: 'Apparels', icon: 'shirt', color: '#A06CD5' },
    { id: '3', name: 'Electronics', icon: 'desktop', color: '#FF8C42' },
    { id: '4', name: 'Investments', icon: 'trending-up', color: '#FFC857' },
    { id: '5', name: 'Life', icon: 'heart', color: '#4CD97B' },
    { id: '6', name: 'Food', icon: 'restaurant', color: '#FF9500' },
    { id: '7', name: 'Medicine', icon: 'medical', color: '#FF6B81' },
    { id: '8', name: 'Bill Payments', icon: 'receipt', color: '#A060FA' },
    { id: '9', name: 'Transport', icon: 'car', color: '#007EA7' },
    { id: '10', name: 'Entertainment', icon: 'film', color: '#F96E46' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Select Category</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.sectionLabel}>ALL CATEGORIES</Text>
              
              <ScrollView style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity 
                    key={category.id} 
                    style={styles.categoryItem}
                    onPress={() => onCategorySelect(category)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon} size={22} color="white" />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#191932',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#9E9EA7',
    marginBottom: 15,
    letterSpacing: 1,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default CategorySelector;