import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { PrimaryButton } from './PrimaryButton';

export function EmptyState({
  title,
  message,
  action,
  onPress
}: {
  title: string;
  message: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={{ padding: 28, alignItems: 'center', gap: 12 }}>
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
        {message}
      </Text>
      {action ? <PrimaryButton onPress={onPress}>{action}</PrimaryButton> : null}
    </View>
  );
}
