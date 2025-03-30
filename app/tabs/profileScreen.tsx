import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, StatusBar,Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {AuthService} from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
};

interface ServiceProviderDashboardScreenProps {
    navigation: any;
  }

const ProfileScreen: React.FC <ServiceProviderDashboardScreenProps>= ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
 

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
  

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2C0E55', '#4B1B86', '#5D2A9C']}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {profile?.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImagePlaceholderText}>
                    {profile?.name.charAt(0)|| 'U'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.qrContainer}>
              <QRCode
                value={profile?.email || 'https://yourapp.com/profile'}
                size={70}
                backgroundColor="white"
                color="#2C0E55"
              />
            </View>
          </View>
          
          <Text style={styles.profileName}>{profile?.name || 'User Name'}</Text> 
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={20} color="#6B3FA0" />
              <Text style={styles.infoText}>{profile?.email || 'user@example.com'}</Text>
              
            </View>
          </View>

          

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C0E55',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
   marginLeft: 80,
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
 
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7B2CBF',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0CFFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#7B2CBF',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6B3FA0',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C0E55',
    marginBottom: 8,
  },
  infoContainer: {
    marginVertical: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  actionText: {
    marginLeft: 6,
    color: '#6B3FA0',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B2CBF',
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfileScreen;