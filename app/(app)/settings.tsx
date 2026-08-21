import Constants from 'expo-constants';
import { Card, List, Text } from 'react-native-paper';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsScreen() {
  const { user, logout, loading } = useAuthStore();
  return (
    <Screen>
      <Text variant="headlineMedium">Settings</Text>
      <Card mode="contained">
        <Card.Content>
          <List.Item title="Account" description={user?.email ?? 'Not signed in'} left={(props) => <List.Icon {...props} icon="account" />} />
          <List.Item title="Theme" description="Follows system light/dark mode" left={(props) => <List.Icon {...props} icon="theme-light-dark" />} />
          <List.Item title="App version" description={Constants.expoConfig?.version ?? '1.0.0'} left={(props) => <List.Icon {...props} icon="information" />} />
          <List.Item title="About" description="Professional volleyball roster and team balancing." left={(props) => <List.Icon {...props} icon="volleyball" />} />
        </Card.Content>
      </Card>
      <PrimaryButton icon="logout" loading={loading} onPress={logout}>
        Logout
      </PrimaryButton>
    </Screen>
  );
}
