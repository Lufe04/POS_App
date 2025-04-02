import { Stack } from "expo-router";
import React from 'react';

export default function RootLayout() {
  return (
      <Stack
      screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="index"/>
        <Stack.Screen name="car"/>
        <Stack.Screen name="success"/>
        <Stack.Screen name="orderStatus"/>
      </Stack>
  )
}