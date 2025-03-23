import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

type SignUpScreenProps = {
  navigation: any;
};

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '893168900765-3jn1873ktv7sq6niq0ld8ta76per050p.apps.googleusercontent.com',
    androidClientId: '893168900765-l6e1ba8a34o5pvv1sn1b7fski5kh6hfo.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      const { authentication } = response;
      // Handle authentication here
      console.log(authentication);
      // Navigate to home screen or handle user data
      setTimeout(() => {
        setLoading(false);
        navigation.replace('Home');
      }, 1000);
    }
  }, [response]);

  const handleSignUp = () => {
    setLoading(true);
    // Handle email/password sign up logic here
    console.log('Sign up with:', { name, email, password });
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Home');
    }, 1500);
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Create Account</Text>
            
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#A9A9A9"
                value={name}
                onChangeText={setName}
              />
              
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
              
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>
              
              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
                disabled={loading}
              >
                <Image 
                  source={require('../assets/images/google-icon.png')} 
                  style={styles.googleIcon} 
                />
                <Text style={styles.googleButtonText}>
                  Continue With Google
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.loginLink}
                onPress={navigateToLogin}
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1E1423',
    },
    scrollContent: {
      flexGrow: 1,
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      // Create a purple gradient background effect
      backgroundColor: '#1E1423', // Dark purple base
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: 'white',
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
    signUpButton: {
      backgroundColor: '#7a4ecf',
      borderRadius: 12,
      height: 55,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 25,
    },
    signUpButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 25,
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
    signUpLink: {
      alignItems: 'center',
      marginTop: 15,
    },
    signUpText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 15,
    },
    signUpBold: {
      color: 'white',
      fontWeight: '600',
    },
    loginLink: {
      alignItems: 'center',
      marginTop: 15,
    },
    loginText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 15,
    },
    loginBold: {
      color: 'white',
      fontWeight: '600',
    },
  });
  export default SignUpScreen;