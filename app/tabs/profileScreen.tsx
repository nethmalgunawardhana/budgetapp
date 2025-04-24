import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, StatusBar, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../services/api';
import QRCode from 'react-native-qrcode-svg';
import { useRouter } from 'expo-router';

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
};



const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation= useRouter();
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await AuthService.getUserProfile();
        console.log('User Data:', userData); // Debugging line
        setProfile(userData.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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
              navigation.replace('../../screens/loginScreen');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleBack = () => {
    navigation.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6246EA" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
     
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileCard}>
            <View style={styles.profileImageWrapper}>
              {profile?.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImagePlaceholderText}>
                    {profile?.name.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.profileName}>{profile?.name || 'User Name'}</Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={profile?.email || 'https://yourapp.com/profile'}
                size={100}
                backgroundColor="white"
                color="#1a1a2e"
              />
              <Text style={styles.qrLabel}>Scan to connect</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#6246EA" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoText}>{profile?.email || 'user@example.com'}</Text>
                </View>
              </View>
              
              {profile?.phone && (
                <View style={styles.infoItem}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="call-outline" size={20} color="#6246EA" />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoText}>{profile.phone}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.actionCardsContainer}>
            <TouchableOpacity 
              style={styles.actionCard}
              
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 86, 94, 0.15)' }]}>
                <Ionicons name="heart" size={24} color="#FF565E" />
              </View>
              <Text style={styles.actionText}>Favorites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(7, 153, 146, 0.15)' }]}>
                <Ionicons name="settings-outline" size={24} color="#079992" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
            
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 159, 26, 0.15)' }]}>
                <Ionicons name="time-outline" size={24} color="#FF9F1A" />
              </View>
              <Text style={styles.actionText}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
             
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(46, 134, 222, 0.15)' }]}>
                <Ionicons name="help-circle-outline" size={24} color="#2E86DE" />
              </View>
              <Text style={styles.actionText}>Help</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          {/* Spacer to ensure content isn't hidden behind tab bar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B2E',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90, // Extra space for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerPlaceholder: {
    width: 44,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  profileImageWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#6246EA',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0CFFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#6246EA',
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 16,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(98, 70, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  actionCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: 'rgba(98, 70, 234, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileText: {
    color: '#6246EA',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6246EA',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#6246EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSpacer: {
    height: 20,
  }
});

export default ProfileScreen;