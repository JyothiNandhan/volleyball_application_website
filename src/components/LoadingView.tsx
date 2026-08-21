import { ActivityIndicator, Text } from 'react-native-paper';
import { View } from 'react-native';

export function LoadingView({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={{ padding: 28, alignItems: 'center', gap: 12 }}>
      <ActivityIndicator />
      <Text>{label}</Text>
    </View>
  );
}
