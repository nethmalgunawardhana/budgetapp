import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from './screens/loginScreen';
import SignUpScreen from './screens/signupScreen';
import TabNavigator from './tabs/tabbar';
import ServiceProviderLoginScreen from './screens/serviceProviderlogin';
import ServiceProviderSignupScreen from './screens/serviceProviderregister';
import ServiceProviderDashboardScreen from './screens/sDashboard';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './types';
const Stack = createStackNavigator<RootStackParamList>();
const NewStack=()=>{

    return (
     
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServiceProviderSignUp" component={ServiceProviderSignupScreen} /> 
       <Stack.Screen name="Login" component={LoginScreen} /> 
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Home" component={TabNavigator} /> 
      <Stack.Screen name="ServiceProviderLogin" component={ServiceProviderLoginScreen} />
      {/*<Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboardScreen} />*/}
         
    </Stack.Navigator>

    );
    }

export default NewStack;
