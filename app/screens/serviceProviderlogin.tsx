import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TextInput, 
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthService } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';



const { width } = Dimensions.get('window');

const ServiceProviderLoginScreen: React.FC = () => {
  const navigation = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleServiceProviderLogin = async () => {
    // Reset error message
    setErrorMessage('');
    
    // Validate inputs
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      // Use a different login method for service providers
      await AuthService.serviceProviderLogin({ email, password });
      console.log('Login successful!');
      // Navigate to the service provider dashboard 
      navigation.navigate('./sDashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      setErrorMessage(errorMsg);
      Alert.alert('Login Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const navigateToServiceProviderSignUp = () => {
    navigation.navigate('./serviceProviderregister');
  };

  const navigateToUserLogin = () => {
    navigation.navigate('./loginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
    
        <ScrollView contentContainerStyle={styles.scrollContent}>
         
          
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Text style={styles.title}>Service Provider Login</Text>
            <Text style={styles.subtitle}>Access your professional dashboard</Text>

            <View style={styles.serviceTypes}>
              <View style={styles.serviceTypeItem}>
                <Image 
                  source={require('../../assets/images/plumber.png')}
                  style={styles.serviceTypeIcon}
                />
                <Text style={styles.serviceTypeText}>Plumber</Text>
              </View>
              <View style={styles.serviceTypeItem}>
                <Image 
                  source={require('../../assets/images/electric.png')}
                  style={styles.serviceTypeIcon}
                />
                <Text style={styles.serviceTypeText}>Electrician</Text>
              </View>
              <View style={styles.serviceTypeItem}>
                <Image 
                  source={require('../../assets/images/handyman.png')}
                  style={styles.serviceTypeIcon}
                />
                <Text style={styles.serviceTypeText}>Handyman</Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Business Email Address"
                placeholderTextColor="#A9A9A9"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleServiceProviderLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login to Dashboard</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomLinks}>
              <TouchableOpacity 
                style={styles.signUpLink}
                onPress={navigateToServiceProviderSignUp}
              >
                <Text style={styles.signUpText}>
                  Not registered yet? <Text style={styles.signUpBold}>Create Account</Text>
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.signUpLink}
                onPress={navigateToUserLogin}
              >
                <Text style={styles.signUpText}>
                  Looking to hire? <Text style={styles.signUpBold}>User Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
  
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1423',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 15,
    zIndex: 10,
    padding: 10,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 25,
    textAlign: 'center',
  },
  serviceTypes: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    width: '100%',
  },
  serviceTypeItem: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  serviceTypeIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  serviceTypeText: {
    color: 'white',
    fontSize: 12,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    marginBottom: 16,
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 10,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: 'rgb(127, 26, 234)',
    borderRadius: 12,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinks: {
    alignItems: 'center',
    marginTop: 10,
  },
  signUpLink: {
    marginVertical: 8,
  },
  signUpText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
  },
  signUpBold: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ServiceProviderLoginScreen;