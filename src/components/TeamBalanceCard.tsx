import { Card, Text } from 'react-native-paper';
import { TeamBalanceMetrics } from '@/types/domain';

export function TeamBalanceCard({ metrics }: { metrics: TeamBalanceMetrics }) {
  return (
    <Card mode="contained">
      <Card.Content style={{ gap: 6 }}>
        <Text variant="titleMedium">Teams successfully balanced</Text>
        <Text>Skill difference: {metrics.totalSkillDifference} point(s)</Text>
        <Text>Average difference: {metrics.averageSkillDifference}</Text>
        <Text>Team size difference: {metrics.teamSizeDifference}</Text>
        <Text>Position coverage: {metrics.positionalImbalance <= 2 ? 'Good' : 'Mixed'}</Text>
        <Text>Balance score: {metrics.overallBalanceScore} ({metrics.confidenceLabel})</Text>
      </Card.Content>
    </Card>
  );
}
