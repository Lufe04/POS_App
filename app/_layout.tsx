import { AuthProvider } from "@/context/authContext/AuthContext";
import { Stack } from "expo-router";
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="auth"/>
        <Stack.Screen name="(app)"/>
      </Stack>
    </AuthProvider>
  )
}
