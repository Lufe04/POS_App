import { Stack } from "expo-router";
import React from 'react';
import { DataProvider } from "@/context/dataContext/OrderContext";

export default function RootLayout() {
  return (
    <DataProvider>
      <Stack
      screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="index"/>
        <Stack.Screen name="orderDetail"/>
      </Stack>
    </DataProvider>
  )
}
