import React from 'react';
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
     
      <Stack.Screen name="(screens)" options={{ headerShown: false }} />
      <Stack.Screen name="tabs/tabbar" options={{ headerShown: false }} />
      <Stack.Screen name="screens/loginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/signupScreen" options={{ headerShown: false }} />
    </Stack>
  );
}