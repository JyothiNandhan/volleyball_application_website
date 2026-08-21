import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { isSupabaseConfigured } from '@/services/env';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="displaySmall">Volleyball Team Manager</Text>
        <Text variant="bodyLarge">Secure roster control and balanced team generation.</Text>
      </View>
      {!isSupabaseConfigured ? (
        <HelperText type="error" visible>
          Add Supabase values to .env before signing in.
        </HelperText>
      ) : null}
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      <PrimaryButton loading={loading} disabled={loading || !email || !password} onPress={() => login(email, password)}>
        Log in
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 8, paddingVertical: 24 }
});
