import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from './loginScreen';
import SignUpScreen from './signupScreen';
import TabNavigator from './tabs/tabbar';
import ServiceProviderLoginScreen from './serviceProviderlogin';
import ServiceProviderSignupScreen from './serviceProviderregister';
import ServiceProviderDashboardScreen from './sDashboard';

const Stack = createStackNavigator();
const NewStack=()=>{

    return (
        <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="ServiceProviderLogin" component={ServiceProviderLoginScreen} />
        <Stack.Screen name="ServiceProviderSignUp" component={ServiceProviderSignupScreen} />
        <Stack.Screen name="ServiceProviderDashboard" component={ServiceProviderDashboardScreen} />
           
        </Stack.Navigator>
    );
    }

export default NewStack;
