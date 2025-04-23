import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Image,
  RefreshControl,
  Linking,
  Alert,
  Modal,
  Animated,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { ServicePostService, ServicePost } from '../../services/serviceprovider';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extended ServicePost interface
interface EnhancedServicePost extends ServicePost {
  userRating?: number;
}

interface ServiceProviderpostScreenProps {
  navigation: any;
}

const USER_RATINGS_KEY = 'user_service_ratings';

const ServicePostsScreen: React.FC<ServiceProviderpostScreenProps> = ({navigation}) => {
  const [servicePosts, setServicePosts] = useState<EnhancedServicePost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<EnhancedServicePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [scaleAnimation] = useState(new Animated.Value(1));

  // Load user ratings from AsyncStorage
  const loadUserRatings = async () => {
    try {
      const savedRatings = await AsyncStorage.getItem(USER_RATINGS_KEY);
      if (savedRatings) {
        setUserRatings(JSON.parse(savedRatings));
      }
    } catch (error) {
      console.error('Error loading user ratings:', error);
    }
  };

  // Save user ratings to AsyncStorage
  const saveUserRating = async (postId: string, rating: number) => {
    try {
      const updatedRatings = { ...userRatings, [postId]: rating };
      setUserRatings(updatedRatings);
      await AsyncStorage.setItem(USER_RATINGS_KEY, JSON.stringify(updatedRatings));
    } catch (error) {
      console.error('Error saving user rating:', error);
    }
  };

  const fetchServicePosts = async () => {
    try {
      setLoading(true);
      const response = await ServicePostService.getAllServicePost();
      if (response.success) {
        // Initialize with ratings if they don't exist
        interface ServicePostResponse {
          success: boolean;
          data: ServicePost[];
          message?: string;
        }

        // Get saved ratings and apply them to posts
        const postsWithRatings: EnhancedServicePost[] = (response as ServicePostResponse).data.map((post: ServicePost) => ({
          ...post,
          rating: post.rating, 
          userRating: userRatings[post.id] || 0
        }));
        setServicePosts(postsWithRatings);
        setFilteredPosts(postsWithRatings);
        console.log('Service posts fetched successfully:', postsWithRatings);
      } else {
        setError('Failed to fetch service posts');
      }
    } catch (error) {
      console.error('Error fetching service posts:', error);
      setError('An error occurred while fetching service posts');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUserRatings().then(() => fetchServicePosts());
    }, [])
  );

  // Update posts when userRatings change
  useEffect(() => {
    if (servicePosts.length > 0) {
      const updatedPosts = servicePosts.map(post => ({
        ...post,
        userRating: userRatings[post.id] || 0
      }));
      setServicePosts(updatedPosts);
      filterPosts(updatedPosts);
    }
  }, [userRatings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserRatings();
    await fetchServicePosts();
    setRefreshing(false);
  };

  useEffect(() => {
    filterPosts(servicePosts);
  }, [searchText, selectedCategory]);

  const filterPosts = (posts = servicePosts) => {
    let filtered = [...posts];
    
    // Apply search filter
    if (searchText) {
      const searchTermLower = searchText.toLowerCase();
      filtered = filtered.filter(
        post => 
          post.title.toLowerCase().includes(searchTermLower) || 
          post.description.toLowerCase().includes(searchTermLower) ||
          post.location.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setFilteredPosts(servicePosts);
  };

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

  const animateCardPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const openRatingModal = (postId: string) => {
    const post = servicePosts.find(p => p.id === postId);
    if (post) {
      setSelectedPostId(postId);
      setCurrentRating(post.userRating || 0);
      setRatingModalVisible(true);
    }
  };

  const closeRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedPostId(null);
    setCurrentRating(0);
  };

  const handleRatingSelection = (rating: number) => {
    setCurrentRating(rating);
  };

  const submitRating = async () => {
    if (!selectedPostId) return;
    
    try {
      setRatingSubmitting(true);
      
      // Save rating to local storage
      await saveUserRating(selectedPostId, currentRating);
      
      // In a real app, you would call an API here
      // const response = await ServicePostService.rateServicePost(selectedPostId, currentRating);
      
      setTimeout(() => {
        const updatedPosts = servicePosts.map(post => {
          if (post.id === selectedPostId) {
            // Calculate new average rating (simulate backend calculation)
            // In a real app, the backend would handle this calculation
            const oldRating = post.rating || 0;
            const newRating = Math.round((oldRating + currentRating) / 2);
            
            return {
              ...post,
              rating: newRating,
              userRating: currentRating
            };
          }
          return post;
        });
        
        setServicePosts(updatedPosts);
        setRatingSubmitting(false);
        closeRatingModal();
        
        // Show success message
        Alert.alert(
          'Rating Submitted',
          'Thank you for your feedback!',
          [{ text: 'OK' }]
        );
      }, 1000); // Simulate network delay
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      setRatingSubmitting(false);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  const renderRatingStars = (rating: number, interactive = false, onRatingPress?: (rating: number) => void) => {
    const stars = [];
    const starSize = interactive ? 36 : 16;
    const starColor = '#FFD700'; // Gold color for stars
    
    for (let i = 1; i <= 5; i++) {
      const starFilled = i <= rating;
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onRatingPress && onRatingPress(i)}
          disabled={!interactive}
          style={{ padding: interactive ? 8 : 2 }}
        >
          <Ionicons
            name={starFilled ? 'star' : 'star-outline'}
            size={starSize}
            color={starFilled ? starColor : '#aaa'}
          />
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars}
      </View>
    );
  };

  const renderServicePost = ({ item }: { item: EnhancedServicePost }) => {
    return (
      <Animated.View 
        style={[
          styles.card,
          { transform: [{ scale: scaleAnimation }] }
        ]}
      >
        <TouchableOpacity 
          style={styles.cardContent}
          activeOpacity={0.9}
          onPress={animateCardPress}
        >
          <View style={styles.cardDecoration} />
          
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.price}>Rs:{item.price}.00/hr</Text>
          </View>
          
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.contactContainer}>
            <View style={styles.profileSection}>
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
              <Text style={styles.contactName}>{item.username}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.phoneButton}
              onPress={() => handleCallContact(item.contactno|| '')}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.phoneNumber}>{item.contactno}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#aaa" />
              <Text style={styles.location}>{item.location}</Text>
            </View>
            
            <View style={styles.ratingSection}>
              
              
              <View style={styles.userRatingContainer}>
                <View style={styles.starRatingRow}>
                  {renderRatingStars(item.userRating || 0)}
                  {item.userRating ? (
                    <Text style={styles.ratedText}>Your rating</Text>
                  ) : null}
                </View>
                
                <TouchableOpacity 
                  style={styles.rateButton}
                  onPress={() => openRatingModal(item.id)}
                >
                  <Text style={styles.rateButtonText}>
                    {item.userRating ? 'Update Rating' : 'Rate Service'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={require('../../assets/images/handyman.png')} 
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>No service posts found</Text>
      <Text style={styles.emptySubText}>
        {searchText || selectedCategory 
          ? 'Try adjusting your filters' 
          : 'Service posts will appear here'}
      </Text>
      {(searchText || selectedCategory) && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1a1a2e" />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Domestic Service</Text>
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Service Posts.."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#aaa" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={styles.picker}
            dropdownIconColor="#aaa"
          >
            <Picker.Item label="All Categories" value="" />
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
      </View>

      {filteredPosts.length > 0 && (
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}
          </Text>
          {(searchText || selectedCategory) && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading service posts...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchServicePosts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderServicePost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
          }
        />
      )}

      {/* Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeRatingModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate this service</Text>
            
            <View style={styles.ratingStarsContainer}>
              {renderRatingStars(currentRating, true, handleRatingSelection)}
            </View>
            
            <Text style={styles.ratingText}>
              {currentRating === 0 ? 'Tap to rate' : `You selected ${currentRating} star${currentRating !== 1 ? 's' : ''}`}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={closeRatingModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.submitButton,
                  currentRating === 0 ? styles.disabledButton : {}
                ]} 
                onPress={submitRating}
                disabled={currentRating === 0 || ratingSubmitting}
              >
                {ratingSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B2E',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1E1B2E',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    backgroundColor: '#1E1B2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252a41',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252a41',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#fff',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#252a41',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  picker: {
    height: 60,
    width: '100%',
    color: '#fff',
  },
  resultCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#252a41',
  },
  resultCountText: {
    color: '#aaa',
    fontSize: 14,
  },
  clearFiltersText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 12,
    color: '#aaa',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#1a1a2e',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardContent: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderWidth: 1,
    borderColor: '#252a41',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#8B5CF6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  categoryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#bbb',
    marginBottom: 16,
    lineHeight: 22,
  },
  contactContainer: {
    backgroundColor: 'rgba(37, 42, 65, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#303652',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
  },
  contactName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    elevation: 2,
  },
  phoneNumber: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  cardFooter: {
    marginTop: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(37, 42, 65, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  location: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  statusContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 8,
  },
  ratingBarBackground: {
    height: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  ratingSection: {
    marginTop: 10,
  },
  userRatingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#252a41',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratedText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#aaa',
  },
  rateButton: {
    backgroundColor: '#FFA500', // Orange color for rate button
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 2,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    backgroundColor: '#1a1a2e',
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.7,
    tintColor: '#8B5CF6',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ddd',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252a41',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#3a3f5c',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#ddd',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#FFA500', // Orange color for submit button
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  }
});

export default ServicePostsScreen;