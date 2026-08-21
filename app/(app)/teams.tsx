import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';

import { CreateTeamDialog } from '@/components/CreateTeamDialog';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TeamBalanceCard } from '@/components/TeamBalanceCard';
import { TeamCard } from '@/components/TeamCard';
import { generateAndShareTeamsPdf } from '@/pdf/teamPdf';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useTeamStore } from '@/stores/teamStore';
import { recommendedTeamCount } from '@/validation/team';

export default function TeamsScreen() {
  const { user } = useAuthStore();
  const players = usePlayerStore((state) => state.players);
  const { teams, metrics, generate, finalize, saving, error, generation } = useTeamStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamCount, setTeamCount] = useState(2);
  const [pdfMessage, setPdfMessage] = useState('');
  const available = players.filter((player) => player.isPlaying);

  const openDialog = () => {
    setTeamCount(recommendedTeamCount(available.length));
    setDialogOpen(true);
  };

  const exportPdf = async () => {
    if (!metrics) return;
    try {
      await generateAndShareTeamsPdf(teams, metrics);
      setPdfMessage('PDF generated successfully.');
    } catch {
      setPdfMessage("We couldn't generate the PDF. Please try again.");
    }
  };

  return (
    <Screen>
      <Text variant="headlineMedium">Teams</Text>
      {teams.length === 0 || !metrics ? (
        <EmptyState
          title="No teams generated"
          message="Create balanced teams from players marked as playing."
          action="Create teams"
          onPress={openDialog}
        />
      ) : (
        <>
          <TeamBalanceCard metrics={metrics} />
          <View style={styles.actions}>
            <Button mode="outlined" icon="refresh" onPress={() => generate(available, teams.length)}>
              Regenerate
            </Button>
            <PrimaryButton
              icon="check"
              loading={saving}
              onPress={() => {
                if (!user) return;
                finalize(user.id);
              }}
            >
              Finalize teams
            </PrimaryButton>
          </View>
          {generation ? <Text>Finalized {new Date(generation.createdAt).toLocaleString()}</Text> : null}
          <PrimaryButton icon="file-pdf-box" onPress={exportPdf}>
            Export PDF
          </PrimaryButton>
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </>
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
        }}
      />
      <Snackbar visible={Boolean(error || pdfMessage)} onDismiss={() => setPdfMessage('')}>
        {error || pdfMessage}
      </Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }
});
