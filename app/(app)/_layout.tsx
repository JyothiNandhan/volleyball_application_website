import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';

export default function AppTabs() {
  const { user } = useAuthStore();
  const loadPlayers = usePlayerStore((state) => state.loadPlayers);

  useEffect(() => {
    if (user) loadPlayers(user.id);
  }, [user, loadPlayers]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.OS === 'web' ? { maxWidth: 720, width: '100%', alignSelf: 'center' } : undefined
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="players" options={{ title: 'Players' }} />
      <Tabs.Screen name="teams" options={{ title: 'Teams' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
