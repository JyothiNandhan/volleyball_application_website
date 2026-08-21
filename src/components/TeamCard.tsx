import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';

import { positionLabel } from '@/constants/positions';
import { Team } from '@/types/domain';
import { RatingStars } from './RatingStars';

export function TeamCard({ team }: { team: Team }) {
  const theme = useTheme();
  const total = team.players.reduce((sum, player) => sum + player.ratingAtGeneration, 0);
  return (
    <Card mode="contained" style={{ backgroundColor: theme.colors.surface }}>
      <Card.Content style={styles.content}>
        <View style={[styles.accent, { backgroundColor: team.color }]} />
        <View style={styles.header}>
          <Text variant="titleLarge">{team.name}</Text>
          <Chip compact>Total {total}</Chip>
          <Chip compact>Avg {team.players.length ? (total / team.players.length).toFixed(2) : '0'}</Chip>
        </View>
        {team.players.map((player, index) => (
          <View key={player.id} style={styles.player}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall">{player.name}</Text>
              <Text variant="bodySmall">{positionLabel(player.positionAtGeneration)}</Text>
            </View>
            <RatingStars rating={player.ratingAtGeneration} size={16} />
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, overflow: 'hidden' },
  accent: { height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  player: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rank: { width: 24, textAlign: 'center' }
});
