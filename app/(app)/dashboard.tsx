import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';

import { CreateTeamDialog } from '@/components/CreateTeamDialog';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { useRosterStats } from '@/hooks/useRosterStats';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useTeamStore } from '@/stores/teamStore';
import { recommendedTeamCount } from '@/validation/team';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { players, loadPlayers, error } = usePlayerStore();
  const { generate, teams } = useTeamStore();
  const stats = useRosterStats(players);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamCount, setTeamCount] = useState(2);

  useEffect(() => {
    if (user) loadPlayers(user.id);
  }, [user, loadPlayers]);

  const available = players.filter((player) => player.isPlaying);

  const openDialog = () => {
    setTeamCount(recommendedTeamCount(available.length));
    setDialogOpen(true);
  };

  return (
    <Screen>
      <Text variant="headlineMedium">Dashboard</Text>
      <View style={styles.grid}>
        <StatCard label="Total Players" value={stats.total} />
        <StatCard label="Playing Today" value={stats.playing} />
        <StatCard label="Average Skill" value={stats.averageRating} />
        <StatCard label="Teams" value={teams.length ? `${teams.length} generated` : 'Not generated'} />
      </View>
      {players.length === 0 ? (
        <EmptyState
          title="No players yet"
          message="Add players before creating teams."
          action="Add players"
          onPress={() => router.push('/players')}
        />
      ) : (
        <PrimaryButton icon="account-group" onPress={openDialog}>
          Create Teams
        </PrimaryButton>
      )}
      <CreateTeamDialog
        visible={dialogOpen}
        availablePlayers={available.length}
        teamCount={teamCount}
        onChangeTeamCount={setTeamCount}
        onDismiss={() => setDialogOpen(false)}
        onCreate={() => {
          setDialogOpen(false);
          generate(available, teamCount);
          router.push('/teams');
        }}
      />
      <Snackbar visible={Boolean(error)} onDismiss={() => undefined}>
        {error}
      </Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }
});
