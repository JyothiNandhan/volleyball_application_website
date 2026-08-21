import { StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';

import { validateTeamCount } from '@/validation/team';
import { PrimaryButton } from './PrimaryButton';

export function CreateTeamDialog({
  visible,
  availablePlayers,
  teamCount,
  onChangeTeamCount,
  onDismiss,
  onCreate
}: {
  visible: boolean;
  availablePlayers: number;
  teamCount: number;
  onChangeTeamCount: (value: number) => void;
  onDismiss: () => void;
  onCreate: () => void;
}) {
  const validation = validateTeamCount(availablePlayers, teamCount);
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Create Teams</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Text variant="titleMedium">{availablePlayers} players available</Text>
          <Text>Choose number of teams</Text>
          <View style={styles.stepper}>
            <IconButton icon="minus" mode="outlined" onPress={() => onChangeTeamCount(Math.max(1, teamCount - 1))} />
            <Text variant="displaySmall">{teamCount}</Text>
            <IconButton icon="plus" mode="outlined" onPress={() => onChangeTeamCount(teamCount + 1)} />
          </View>
          <View style={styles.summary}>
            <Text variant="titleSmall">Recommended setup</Text>
            <Text>
              {teamCount} teams x approximately {validation.approximatePlayersPerTeam} players
            </Text>
            <Text>{validation.message}</Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <PrimaryButton disabled={!validation.valid} onPress={onCreate}>
            Create teams
          </PrimaryButton>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { borderRadius: 8 },
  content: { gap: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  summary: { gap: 4, padding: 12, borderRadius: 8, backgroundColor: 'rgba(30,122,88,0.12)' }
});
