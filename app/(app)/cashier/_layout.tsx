import { DataProvider } from "@/context/dataContext/OrderContext";
import { Stack } from "expo-router";
import React from 'react';

export default function RootLayout() {
  return (
    <DataProvider>
      <Stack
      screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="index"/>
      </Stack>
      </DataProvider>
  )
}