import { AuthProvider } from "@/context/authContext/AuthContext";
import { DataProvider } from "@/context/dataContext/DataContext";
import { Stack } from "expo-router";
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
      <Stack
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="auth"/>
        <Stack.Screen name="(app)"/>
      </Stack>
      </DataProvider>
    </AuthProvider>
  )
}
