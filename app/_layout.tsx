import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as Font from 'expo-font';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'TVCD': require('../assets/fonts/TVCD.ttf'),
      });
    }
    loadFonts();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
