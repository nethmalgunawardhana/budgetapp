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
  Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { ServicePostService, ServicePost } from '../../services/serviceprovider';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

// Extended ServicePost interface
interface EnhancedServicePost extends ServicePost {
  rating?: number;
  userRating?: number;
}

interface ServiceProviderpostScreenProps {
  navigation: any;
}

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

  const fetchServicePosts = async () => {
    try {
      setLoading(true);
      const response = await ServicePostService.getAllServicePost();
      if (response.success) {
        // Initialize with ratings if they don't exist
        const postsWithRatings: EnhancedServicePost[] = response.data.map(post => ({
          ...post,
          rating: post.rating, 
          userRating: 0
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
      fetchServicePosts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServicePosts();
    setRefreshing(false);
  };

  useEffect(() => {
    filterPosts();
  }, [searchText, selectedCategory, servicePosts]);

  const filterPosts = () => {
    let filtered = [...servicePosts];
    
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
      
      // In a real app, you would call an API here
      // const response = await ServicePostService.rateServicePost(selectedPostId, currentRating);
      
      // For now, we'll update the local state
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
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.price}>Rs:{item.price}</Text>
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
            <View style={styles.statusContainer}>
              <Text style={styles.ratingText}>Rating: {item.rating}%</Text>
              <View style={[
                styles.ratingBar, 
                { width: item.rating !== undefined ? `${item.rating}%` : '0%' }
              ]} />
            </View>
            
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
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
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
    backgroundColor: '#16213e',
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
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#252a41',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: '#252a41',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  contactName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  phoneNumber: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  cardFooter: {
    marginTop: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 4,
  },
  statusContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  ratingBar: {
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  ratingSection: {
    marginTop: 8,
  },
  userRatingContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#252a41',
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratedText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#aaa',
  },
  rateButton: {
    backgroundColor: '#3a3f5c',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 12,
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
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252a41',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#8B5CF6',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ServicePostsScreen;