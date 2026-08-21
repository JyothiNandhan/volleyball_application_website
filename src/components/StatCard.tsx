import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export function StatCard({ label, value }: { label: string; value: string | number }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="headlineMedium">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140, padding: 16, borderRadius: 8, gap: 6 }
});
