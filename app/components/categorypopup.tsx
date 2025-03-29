import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionService } from '../../services/transactionService';

interface CategoryItem {
  id?: string;
  name: string;
  icon: string;
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
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryIcon, setCustomCategoryIcon] = useState('💰');
  const [selectedColor, setSelectedColor] = useState('#FF5733');
  
  // Available icons for custom categories
  const availableIcons = ['💰', '🛒', '🏠', '🚗', '💻', '🍔', '👕', '💊', '🎮', '📚', '✈️', '🎁'];
  
  // Available colors
  const availableColors = [
    '#FF5733', '#33A8FF', '#33FF57', '#FF33A8', 
    '#A833FF', '#F3FF33', '#33FFF3', '#FF8333'
  ];
  
  // Main predefined categories
  const mainCategories = [
    { name: 'Housing', description: 'Rent, Mortgage, Property Taxes, Maintenance' },
    { name: 'Utilities', description: 'Electricity, Water, Gas, Internet, Phone' },
    { name: 'Groceries', description: 'Food, Household Essentials' },
    { name: 'Transportation', description: 'Fuel, Public Transport, Car Payments, Insurance' },
    { name: 'Insurance', description: 'Health, Life, Auto, Home' },
    { name: 'Debt Payments', description: 'Loans, Credit Cards, EMIs' },
    { name: 'Other', description: 'Add custom category' }
  ];

  // Handle selecting a main category
  const handleSelectMainCategory = (categoryName: string) => {
    if (categoryName === 'Other') {
      setShowAddCustom(true);
    } else {
      // Select main category
      const selectedCategory: CategoryItem = {
        name: categoryName,
        icon: '💰', // Default icon for main categories
        color: '#FF5733' // Default color for main categories
      };
      onCategorySelect(selectedCategory);
      onClose();
    }
  };

  // Handle adding a custom category
  const handleAddCustomCategory = async () => {
    if (!customCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const newCategory: CategoryItem = {
        name: customCategoryName.trim(),
        icon: customCategoryIcon,
        color: selectedColor
      };
      
      onCategorySelect(newCategory);
      onClose();
      
      // Reset form
      setCustomCategoryName('');
      setShowAddCustom(false);
      
    } catch (error) {
      console.error('Error adding custom category:', error);
      Alert.alert('Error', 'Failed to add custom category');
    }
  };

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
              {!showAddCustom ? (
                // Category selection view
                <>
                  <View style={styles.header}>
                    <Text style={styles.title}>Select Category</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Main Categories Section */}
                  <Text style={styles.sectionLabel}>CATEGORIES</Text>
                  <ScrollView style={styles.categoriesContainer}>
                    {mainCategories.map((category, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.mainCategoryItem}
                        onPress={() => handleSelectMainCategory(category.name)}
                      >
                        <View style={styles.mainCategoryContent}>
                          <Text style={styles.mainCategoryName}>{category.name}</Text>
                          <Text style={styles.mainCategoryDescription}>{category.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9E9EA7" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : (
                // Add custom category view
                <>
                  <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowAddCustom(false)} style={styles.backButton}>
                      <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Add Custom Category</Text>
                    <View style={{ width: 24 }} />
                  </View>
                  
                  <ScrollView 
                    style={styles.customFormScrollContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                   bounces={true}
                   >
                    <View style={styles.customCategoryForm}>
                      {/* Custom category name input */}
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>CATEGORY NAME</Text>
                        <TextInput
                          style={styles.fieldValue}
                          value={customCategoryName}
                          onChangeText={setCustomCategoryName}
                          placeholder="Enter category name"
                          placeholderTextColor="#9E9EA7"
                        />
                        <View style={styles.fieldUnderline} />
                      </View>
                      
                      {/* Icon selection */}
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>SELECT ICON</Text>
                        <View style={styles.iconGrid}>
                          {availableIcons.map((icon, index) => (
                            <TouchableOpacity 
                              key={index}
                              style={[
                                styles.iconOption,
                                customCategoryIcon === icon && styles.selectedIconOption
                              ]}
                              onPress={() => setCustomCategoryIcon(icon)}
                            >
                              <Text style={styles.iconOptionText}>{icon}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      
                      {/* Color selection */}
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>SELECT COLOR</Text>
                        <View style={styles.colorGrid}>
                          {availableColors.map((color, index) => (
                            <TouchableOpacity 
                              key={index}
                              style={[
                                styles.colorOption,
                                { backgroundColor: color },
                                selectedColor === color && styles.selectedColorOption
                              ]}
                              onPress={() => setSelectedColor(color)}
                            />
                          ))}
                        </View>
                      </View>
                      
                      {/* Preview */}
                      <View style={styles.previewContainer}>
                        <Text style={styles.fieldLabel}>PREVIEW</Text>
                        <View style={styles.previewContent}>
                          <View style={[styles.iconContainer, { backgroundColor: selectedColor }]}>
                            <Text style={styles.iconText}>{customCategoryIcon}</Text>
                          </View>
                          <Text style={styles.categoryName}>
                            {customCategoryName || 'Category Name'}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Add button */}
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={handleAddCustomCategory}
                      >
                        <Text style={styles.addButtonText}>Add Category</Text>
                      </TouchableOpacity>
                      
                      {/* Add padding at the bottom for better scrolling experience */}
                      <View style={styles.bottomPadding} />
                    </View>
                  </ScrollView>
                </>
              )}
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
    maxHeight: '90%',
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
  backButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A3C',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
    paddingVertical: 5,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#9E9EA7',
    marginBottom: 15,
    letterSpacing: 1,
  },
  categoriesContainer: {
    marginBottom: 20,
    maxHeight: 400,
  },
  customFormScrollContainer: {
    flexGrow: 0,
  },
  mainCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainCategoryContent: {
    flex: 1,
  },
  mainCategoryName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    marginBottom: 4,
  },
  mainCategoryDescription: {
    fontSize: 13,
    color: '#9E9EA7',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconText: {
    color: 'white',
    fontSize: 18,
  },
  categoryName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#9E9EA7',
    fontSize: 16,
  },
  customCategoryForm: {
    flexGrow: 1,
    maxHeight: '90%',
  },
  formField: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#9E9EA7',
    marginBottom: 12,
    letterSpacing: 1,
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A3C',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  selectedIconOption: {
    borderWidth: 2,
    borderColor: '#FF5733',
  },
  iconOptionText: {
    fontSize: 22,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: 'white',
  },
  previewContainer: {
    marginBottom: 30,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#2A2A3C',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  addButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomPadding: {
    height: 30
  }
});

export default CategorySelector;