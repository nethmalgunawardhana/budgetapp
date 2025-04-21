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
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { AuthService } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();



const { width } = Dimensions.get('window');

const LoginScreen: React.FC= () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '893168900765-3jn1873ktv7sq6niq0ld8ta76per050p.apps.googleusercontent.com',
    androidClientId: '893168900765-l6e1ba8a34o5pvv1sn1b7fski5kh6hfo.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response.authentication?.accessToken);
    }
  }, [response]);

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

  const handleGoogleSignIn = async (googleToken?: string) => {
    if (!googleToken) {
      Alert.alert('Error', 'Failed to obtain Google token');
      return;
    }

    setLoading(true);
    try {
      await AuthService.googleSignIn(googleToken);
      router.replace('../tabs/tabbar');
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to sign in with Google. Please try again.'
      );
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
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
      await AuthService.login({ email, password });
      router.replace('../tabs/tabbar');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      setErrorMessage(errorMsg);
      Alert.alert('Login Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.replace('./signupScreen');
  };

  const navigateToServiceProviderLogin = () => {
    router.replace('./serviceProviderlogin');
  };

  const navigateToServiceProviderSignUp = () => {
    router.replace('./serviceProviderregister');
  };

  const initiateGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-In Initiation Error:', error);
      Alert.alert('Error', 'Failed to initiate Google Sign-In');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1E1423', '#32204A', '#2A1C3D']}
        style={styles.gradient}
      >
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
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
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
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={initiateGoogleSignIn}
              disabled={loading}
            >
              <Image 
                source={require('../../assets/images/google-icon.png')} 
                style={styles.googleIcon} 
              />
              <Text style={styles.googleButtonText}>
                Continue With Google
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceProviderButton}
              onPress={navigateToServiceProviderLogin}
              disabled={loading}
            >
              <Image 
                source={require('../../assets/images/handyman.png')} 
                style={styles.serviceIcon} 
              />
              <Text style={styles.serviceButtonText}>
                Login as Service Provider
              </Text>
            </TouchableOpacity>
            
            <View style={styles.bottomLinks}>
              <TouchableOpacity 
                style={styles.signUpLink}
                onPress={navigateToSignUp}
              >
                <Text style={styles.signUpText}>
                  Don't have an account? <Text style={styles.signUpBold}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.signUpLink}
                onPress={navigateToServiceProviderSignUp}
              >
                <Text style={styles.signUpText}>
                  Register as Service Provider
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
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
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 350,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    backgroundColor: '#7a4ecf',
    borderRadius: 12,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    shadowColor: '#7a4ecf',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
    maxWidth: 350,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceProviderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    shadowColor: 'rgba(255, 255, 255, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  serviceIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  serviceButtonText: {
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
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
  },
  signUpBold: {
    color: 'white',
    fontWeight: '600',
  },
});

export default LoginScreen;