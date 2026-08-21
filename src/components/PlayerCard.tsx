import { StyleSheet, View } from 'react-native';
import { Card, Chip, IconButton, Text, useTheme } from 'react-native-paper';

import { positionLabel } from '@/constants/positions';
import { Player } from '@/types/domain';
import { RatingStars } from './RatingStars';

export function PlayerCard({
  player,
  onEdit,
  onToggle
}: {
  player: Player;
  onEdit?: () => void;
  onToggle?: () => void;
}) {
  const theme = useTheme();
  return (
    <Card mode="contained" style={{ backgroundColor: theme.colors.surface }}>
      <Card.Content style={styles.content}>
        <View style={styles.main}>
          <Text variant="titleMedium">{player.name}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {positionLabel(player.position)}
          </Text>
          <RatingStars rating={player.rating} />
        </View>
        <View style={styles.actions}>
          <Chip
            icon={player.isPlaying ? 'check-circle' : 'pause-circle'}
            compact
            onPress={onToggle}
            accessibilityLabel={player.isPlaying ? 'Mark not playing' : 'Mark playing'}
          >
            {player.isPlaying ? 'Playing' : 'Not playing'}
          </Chip>
          <IconButton icon="pencil" onPress={onEdit} accessibilityLabel="Edit player" />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  main: { flex: 1, gap: 4 },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between' }
});
