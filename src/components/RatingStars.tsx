import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
};

export function RatingStars({ rating, onChange, size = 20 }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityLabel={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Pressable
          key={value}
          onPress={() => onChange?.(value)}
          disabled={!onChange}
          accessibilityRole={onChange ? 'button' : undefined}
          accessibilityLabel={`Set rating to ${value}`}
          style={styles.starButton}
        >
          <Text style={{ fontSize: size, color: value <= rating ? theme.colors.secondary : theme.colors.outline }}>
            {value <= rating ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  starButton: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' }
});
