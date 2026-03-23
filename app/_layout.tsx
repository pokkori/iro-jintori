import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { usePlayerStore } from '../src/store/player-store';
import { useSettingsStore } from '../src/store/settings-store';

export default function RootLayout() {
  const loadProfile = usePlayerStore(s => s.loadProfile);
  const loadSettings = useSettingsStore(s => s.loadSettings);

  useEffect(() => {
    loadProfile();
    loadSettings();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1A1A2E' },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
