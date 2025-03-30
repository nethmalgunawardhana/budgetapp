import React, { useState, useEffect, useRef } from 'react';
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
  ScrollView,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

type ServiceProviderSignUpScreenProps = {
  navigation: any;
};

const { width } = Dimensions.get('window');

const ServiceProviderSignUpScreen: React.FC<ServiceProviderSignUpScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const progressAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  useEffect(() => {
    // Animate progress bar when step changes
    Animated.timing(progressAnim, {
      toValue: currentStep / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleNextStep = () => {
    // Validate first step
    if (currentStep === 1) {
      if (!businessName || !ownerName || !serviceType) {
        setErrorMessage('Please fill all required fields');
        return;
      }
      setErrorMessage('');
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceProviderSignUp = async () => {
    // Reset error message
    setErrorMessage('');
    
    // Validate inputs
    if (!email || !password || !confirmPassword || !phone) {
      setErrorMessage('Please fill all required fields');
      return;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    try {
      await AuthService.serviceProviderSignUp({ 
        businessName, 
        ownerName, 
        email, 
        phone, 
        password,
        serviceType 
      });
      Alert.alert(
        'Registration Successful', 
        'Your account has been created! Our team will review your application and get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.navigate('ServiceProviderLogin') }]
      );
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessage(errorMsg);
      Alert.alert('Registration Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Business Name"
        placeholderTextColor="#A9A9A9"
        value={businessName}
        onChangeText={setBusinessName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Owner's Full Name"
        placeholderTextColor="#A9A9A9"
        value={ownerName}
        onChangeText={setOwnerName}
      />
      
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Service Type</Text>
        <Picker
          selectedValue={serviceType}
          onValueChange={(itemValue) => setServiceType(itemValue)}
          style={styles.picker}
          dropdownIconColor="white"
        >
          <Picker.Item label="Plumber" value="plumber" />
          <Picker.Item label="Electrician" value="electrician" />
          <Picker.Item label="Handyman" value="handyman" />
          <Picker.Item label="Carpenter" value="carpenter" />
          <Picker.Item label="Painter" value="painter" />
          <Picker.Item label="HVAC Technician" value="hvac" />
          <Picker.Item label="Landscaper" value="landscaper" />
          <Picker.Item label="Cleaner" value="cleaner" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>
      
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={handleNextStep}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <Ionicons name="arrow-forward" size={20} color="white" style={styles.nextIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
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
        placeholder="Phone Number"
        placeholderTextColor="#A9A9A9"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A9A9A9"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#A9A9A9"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handlePreviousStep}
        >
          <Ionicons name="arrow-back" size={20} color="white" style={styles.backIcon} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleServiceProviderSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1A5276', '#2874A6', '#2E86C1']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>
              {currentStep === 1 ? 'Join as a Service Provider' : 'Create Your Account'}
            </Text>
            <Text style={styles.subtitle}>
              {currentStep === 1 ? 'Tell us about your business' : 'Set up your login credentials'}
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]}
                />
              </View>
              <View style={styles.stepsTextContainer}>
                <Text style={styles.stepsText}>Step {currentStep} of {totalSteps}</Text>
              </View>
            </View>

            {currentStep === 1 ? renderStep1() : renderStep2()}
            
            <View style={styles.bottomLinks}>
              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => navigation.navigate('ServiceProviderLogin')}
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginBold}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 10,
    padding: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
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
  progressContainer: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498DB',
    borderRadius: 3,
  },
  stepsTextContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  stepsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
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
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    height: 55,
    color: 'white',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 10,
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  nextIcon: {
    marginLeft: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backIcon: {
    marginRight: 5,
  },
  createButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    width: '65%',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinks: {
    alignItems: 'center',
    marginTop: 25,
  },
  loginLink: {
    marginVertical: 8,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
  },
  loginBold: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ServiceProviderSignUpScreen;