import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from './loginScreen';
import SignUpScreen from './signupScreen';

const Stack = createStackNavigator();
const NewStack=()=>{

    return (
        <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );
    }

export default NewStack;
