import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Platform,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ServicePostService, ServicePost } from '../services/serviceprovider';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { AuthService } from '../services/api'; // Import AuthService
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { jwtDecode } from 'jwt-decode';

interface CreateServicePostData {
  title: string;
  username: string; 
  contactno: string; // Changed to string for better input handling
  description: string;
  price: number;
  category: string;
  location: string;
}

interface JWTPayload {
    name: string;
}

interface UpdateServicePostData extends CreateServicePostData {
  id: string;
}

interface ServiceProviderDashboardScreenProps {
  navigation: any;
}

const ServiceProviderDashboardScreen: React.FC<ServiceProviderDashboardScreenProps> = ({ navigation }) => {
  // State management
  const [servicePosts, setServicePosts] = useState<ServicePost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<ServicePost | null>(null);
  const [userName, setUserName] = useState<string>('Provider'); // Added state for user name
  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [contactno, setContactno] = useState<string>(''); // Added contact number state
  const [formError, setFormError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Statistics
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [activePosts, setActivePosts] = useState<number>(0);
  const [inactivePosts, setInactivePosts] = useState<number>(0);

  // Fetch user profile and service posts when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchServicePosts();
    }, [])
  );

  // Fetch user profile to get name
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Retrieve the JWT token from AsyncStorage
        const token = await AsyncStorage.getItem('accessToken');
        
        if (token) {
          // Decode the JWT token
          const decoded = jwtDecode<JWTPayload>(token);
          console.log('Decoded JWT:', decoded.name);
          // Set username and email
          setUserName(decoded.name || 'provider');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // Handle logout
  const handleLogout = async (): Promise<void> => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Fetch all service posts
  const fetchServicePosts = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await ServicePostService.getServicePosts();
      
      // Debug the structure of the response
      console.log('Service Posts Response:', JSON.stringify(response));
      
      // More robust handling of the response
      if (response && response.data) {
        setServicePosts(response.data);
        
        // Calculate statistics
        setTotalPosts(response.data.length);
        setActivePosts(response.data.filter((post: ServicePost) => post.status === 'active').length);
        setInactivePosts(response.data.filter((post: ServicePost) => post.status === 'inactive').length);
      } else if (response && Array.isArray(response)) {
        // In case the response itself is the array of posts
        setServicePosts(response);
        
        // Calculate statistics
        setTotalPosts(response.length);
        setActivePosts(response.filter((post: ServicePost) => post.status === 'active').length);
        setInactivePosts(response.filter((post: ServicePost) => post.status === 'inactive').length);
      } else {
        // Fallback to empty array if response structure is unexpected
        console.error('Unexpected response structure:', response);
        setServicePosts([]);
        setTotalPosts(0);
        setActivePosts(0);
        setInactivePosts(0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load your service posts');
      console.error('Error fetching service posts:', error);
      
      // Set default empty values on error
      setServicePosts([]);
      setTotalPosts(0);
      setActivePosts(0);
      setInactivePosts(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = (): void => {
    setRefreshing(true);
    fetchServicePosts();
  };

  // Open modal for new post
  const handleAddPost = (): void => {
    resetForm();
    setIsEditMode(false);
    setIsModalVisible(true);
  };

  // Open modal to edit existing post
  const handleEditPost = (post: ServicePost): void => {
    setIsEditMode(true);
    setSelectedPost(post);
    
    // Pre-fill form data
    setTitle(post.title);
    setDescription(post.description);
    setPrice(post.price.toString());
    setCategory(post.category);
    setLocation(post.location);
    setContactno(post.contactno || ''); // Add contact number
    
    setIsModalVisible(true);
  };

  // Handle delete post
  const handleDeletePost = (postId: string): void => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this service post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ServicePostService.deleteServicePost(postId);
              // Update local state after deletion
              setServicePosts(servicePosts.filter(post => post.id !== postId));
              
              // Update statistics
              const deletedPost = servicePosts.find(post => post.id === postId);
              if (deletedPost) {
                setTotalPosts(totalPosts - 1);
                if (deletedPost.status === 'active') {
                  setActivePosts(activePosts - 1);
                } else if (deletedPost.status === 'inactive') {
                  setInactivePosts(inactivePosts - 1);
                }
              }
              
              Alert.alert('Success', 'Service post deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete service post');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  // Handle calling the contact number
  const handleCallContact = (phoneNumber: string): void => {
    if (!phoneNumber) return;
    
    // Format the phone number for dialing
    const phoneUrl = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone dialer is not available on this device');
        }
      })
      .catch(error => {
        console.error('Error opening phone dialer:', error);
        Alert.alert('Error', 'Failed to open phone dialer');
      });
  };

  // Handle toggle post status (active/inactive)
  const handleToggleStatus = async (post: ServicePost): Promise<void> => {
    const newStatus: "active" | "inactive" = post.status === 'active' ? 'inactive' : 'active';
    
    try {
      await ServicePostService.toggleServiceStatus(post.id, newStatus);
      
      // Update local state
      const updatedPosts = servicePosts.map(p => {
        if (p.id === post.id) {
          return { ...p, status: newStatus };
        }
        return p;
      });
      
      setServicePosts(updatedPosts);
      
      // Update statistics
      if (newStatus === 'active') {
        setActivePosts(activePosts + 1);
        setInactivePosts(inactivePosts - 1);
      } else {
        setActivePosts(activePosts - 1);
        setInactivePosts(inactivePosts + 1);
      }
      
      Alert.alert('Success', `Service post ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update service post status');
      console.error(error);
    }
  };

  // Reset form state
  const resetForm = (): void => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setLocation('');
    setContactno(''); // Reset contact number
    setFormError('');
    setSelectedPost(null);
  };

  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    // Validate form
    if (!title || !description || !price || !category || !location || !contactno) {
      setFormError('Please fill all required fields');
      return;
    }
    setIsLoading(true);
    try {
      const postData: CreateServicePostData = {
        title,
        username: userName,
        description,
        price: parseFloat(price),
        contactno,
        category,
        location,
      };
      
      let response: ServicePost;
      
      if (isEditMode && selectedPost) {
        // Update existing post
        response = await ServicePostService.updateServicePost(selectedPost.id, postData);
        
        // Update local state
        const updatedPosts = servicePosts.map(post => {
          if (post.id === selectedPost.id) {
            return { ...post, ...response };
          }
          return post;
        });
        
        setServicePosts(updatedPosts);
        Alert.alert('Success', 'Service post updated successfully');
      } else {
        // Create new post
        response = await ServicePostService.createServicePost(postData);
        
        // Update local state
        setServicePosts([response, ...servicePosts]);
        setTotalPosts(totalPosts + 1);
        setActivePosts(activePosts + 1); // New posts are active by default
        
        Alert.alert('Success', 'Service post created successfully');
      }
      
      // Close modal and reset form
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', isEditMode ? 'Failed to update service post' : 'Failed to create service post');
      console.error(error);
    }finally{
      setIsLoading(false);
    }
  };

  // Render each service post card
  const renderServicePostCard = ({ item }: { item: ServicePost }): React.ReactElement => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postTitleContainer}>
          <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'active' ? '#27AE60' : '#95A5A6' }
          ]}>
            <Text style={styles.statusText}>{item.status === 'active' ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <Text style={styles.postPrice}>${item.price}</Text>
      </View>
      
      <Text style={styles.postDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.postInfo}>
        <View style={styles.postInfoItem}>
          <Ionicons name="location" size={16} color="#7F8C8D" />
          <Text style={styles.postInfoText} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.postInfoItem}>
          <Ionicons name="pricetag" size={16} color="#7F8C8D" />
          <Text style={styles.postInfoText} numberOfLines={1}>{item.category}</Text>
        </View>
      </View>
      
      {/* Add contact number display with phone icon */}
      {item.contactno && (
        <TouchableOpacity 
          style={styles.contactContainer}
          onPress={() => handleCallContact(item.contactno)}
        >
          <Ionicons name="call" size={16} color="#3498DB" />
          <Text style={styles.contactText}>{item.contactno}</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleToggleStatus(item)}
        >
          <MaterialIcons 
            name={item.status === 'active' ? 'visibility-off' : 'visibility'} 
            size={18} 
            color="#3498DB" 
          />
          <Text style={[styles.actionButtonText, { color: '#3498DB' }]}>
            {item.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditPost(item)}
        >
          <MaterialIcons name="edit" size={18} color="#F39C12" />
          <Text style={[styles.actionButtonText, { color: '#F39C12' }]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeletePost(item.id)}
        >
          <MaterialIcons name="delete" size={18} color="#E74C3C" />
          <Text style={[styles.actionButtonText, { color: '#E74C3C' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render service post form modal
  const renderPostFormModal = (): React.ReactElement => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Edit Service Post' : 'Create New Service Post'}
            </Text>
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => {
                setIsModalVisible(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Service Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Professional Plumbing Service"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your service in detail"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            
            <Text style={styles.inputLabel}>Price (USD) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 75.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
            
            {/* Add contact number field */}
            <Text style={styles.inputLabel}>Contact Number *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. +1 555-123-4567"
              value={contactno}
              onChangeText={setContactno}
              keyboardType="phone-pad"
              maxLength={15}
            />
            
            <Text style={styles.inputLabel}>Category *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue: string) => setCategory(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select a category" value="" />
                <Picker.Item label="Plumbing" value="plumbing" />
                <Picker.Item label="Electrical" value="electrical" />
                <Picker.Item label="Carpentry" value="carpentry" />
                <Picker.Item label="Painting" value="painting" />
                <Picker.Item label="Landscaping" value="landscaping" />
                <Picker.Item label="Cleaning" value="cleaning" />
                <Picker.Item label="HVAC" value="hvac" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
            
            <Text style={styles.inputLabel}>Location *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. New York, NY"
              value={location}
              onChangeText={setLocation}
            />
            
            {formError ? (
              <Text style={styles.errorText}>{formError}</Text>
            ) : null}
            
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update Service Post' : 'Create Service Post'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1A5276', '#2874A6', '#2E86C1']}
        style={styles.headerGradient}
      >
        <View style={styles.topBar}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Service Dashboard</Text>
            <Text style={styles.headerSubtitle}>Manage your service posts</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPost}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="document-text" size={22} color="#3498DB" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalPosts}</Text>
              <Text style={styles.statLabel}>Total Posts</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.activeIcon]}>
              <Ionicons name="checkmark-circle" size={22} color="#27AE60" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{activePosts}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.inactiveIcon]}>
              <Ionicons name="eye-off" size={22} color="#7F8C8D" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{inactivePosts}</Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Service Posts</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#3498DB" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498DB" />
            <Text style={styles.loadingText}>Loading your service posts...</Text>
          </View>
        ) : servicePosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>No service posts yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first service post to start receiving requests
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={handleAddPost}
            >
              <Text style={styles.createFirstButtonText}>Create Your First Post</Text>
              <Ionicons name="add-circle" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            style={styles.postList}
            data={servicePosts}
            renderItem={renderServicePostCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3498DB']}
                tintColor="#3498DB"
              />
            }
          />
        )}
      </View>
      
      {renderPostFormModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeIcon: {
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
  },
  inactiveIcon: {
    backgroundColor: 'rgba(127, 140, 141, 0.2)',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  refreshButton: {
    padding: 4
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: 'row',
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  postList: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  postPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  postImageContainer: {
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 8,
    color: '#95A5A6',
    fontSize: 14,
  },
  postDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  postInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  postInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postInfoText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#3498DB',
    marginLeft: 6,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  closeModal: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    maxHeight: '80%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#3498DB',
    marginLeft: 8,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E',
    marginBottom: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  errorText: {
    color: '#E74C3C',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceProviderDashboardScreen;