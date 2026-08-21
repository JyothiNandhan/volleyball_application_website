import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Dialog, IconButton, Portal, Searchbar, SegmentedButtons, Text } from 'react-native-paper';

import { EmptyState } from '@/components/EmptyState';
import { LoadingView } from '@/components/LoadingView';
import { PlayerCard } from '@/components/PlayerCard';
import { PlayerForm, PlayerFormHandle } from '@/components/PlayerForm';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { PLAYER_POSITIONS } from '@/constants/positions';
import { samplePlayers } from '@/data/samplePlayers';
import { useRosterStats } from '@/hooks/useRosterStats';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { Player } from '@/types/domain';
import { PlayerInput } from '@/validation/player';

type SortMode = 'name' | 'rating';

export default function PlayersScreen() {
  const { user } = useAuthStore();
  const { players, addPlayer, updatePlayer, removePlayer, loading, saving } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState('all');
  const [playingOnly, setPlayingOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>('name');
  const [editing, setEditing] = useState<Player | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<PlayerFormHandle>(null);
  const stats = useRosterStats(players);

  const filtered = useMemo(() => {
    return players
      .filter((player) => player.name.toLowerCase().includes(query.toLowerCase()))
      .filter((player) => position === 'all' || player.position === position)
      .filter((player) => !playingOnly || player.isPlaying)
      .sort((a, b) => (sort === 'rating' ? b.rating - a.rating : a.name.localeCompare(b.name)));
  }, [players, query, position, playingOnly, sort]);

  const save = async (input: PlayerInput) => {
    if (!user) return;
    if (editing) await updatePlayer(editing.id, input);
    else await addPlayer(user.id, input);
    setFormOpen(false);
    setEditing(undefined);
  };

  const seedDemo = async () => {
    if (!user) return;
    for (const player of samplePlayers) {
      await addPlayer(user.id, {
        name: player.name,
        position: player.position,
        rating: player.rating,
        isPlaying: player.isPlaying,
        notes: player.notes,
        photoUrl: null
      });
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="headlineMedium">Players</Text>
        <IconButton
          icon="plus"
          mode="contained"
          accessibilityLabel="Add player"
          onPress={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        />
      </View>
      <View style={styles.grid}>
        <StatCard label="Players" value={stats.total} />
        <StatCard label="Playing" value={stats.playing} />
        <StatCard label="Not Playing" value={stats.notPlaying} />
        <StatCard label="Average Rating" value={stats.averageRating} />
      </View>
      <Searchbar placeholder="Search roster" value={query} onChangeText={setQuery} />
      <SegmentedButtons
        value={sort}
        onValueChange={(value) => setSort(value as SortMode)}
        buttons={[
          { value: 'name', label: 'A-Z' },
          { value: 'rating', label: 'Rating' }
        ]}
      />
      <View style={styles.chips}>
        <Chip selected={position === 'all'} onPress={() => setPosition('all')}>
          All
        </Chip>
        {PLAYER_POSITIONS.map((item) => (
          <Chip key={item.value} selected={position === item.value} onPress={() => setPosition(item.value)}>
            {item.shortLabel}
          </Chip>
        ))}
        <Chip selected={playingOnly} onPress={() => setPlayingOnly((value) => !value)}>
          Playing only
        </Chip>
      </View>
      {loading ? <LoadingView label="Loading roster..." /> : null}
      {!loading && players.length === 0 ? (
        <EmptyState title="No players have been added yet" message="Add players before creating teams." action="Load demo roster" onPress={seedDemo} />
      ) : null}
      {filtered.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onEdit={() => {
            setEditing(player);
            setFormOpen(true);
          }}
          onToggle={() =>
            updatePlayer(player.id, {
              name: player.name,
              position: player.position,
              rating: player.rating,
              isPlaying: !player.isPlaying,
              notes: player.notes,
              photoUrl: player.photoUrl
            })
          }
        />
      ))}
      <Portal>
        <Dialog visible={formOpen} onDismiss={() => setFormOpen(false)} style={{ borderRadius: 8 }}>
          <Dialog.Title>{editing ? 'Edit Player' : 'Create Player'}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView contentContainerStyle={styles.dialogScrollContent} keyboardShouldPersistTaps="handled">
              <PlayerForm ref={formRef} initial={editing} saving={saving} onSubmit={save} />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setFormOpen(false)}>Cancel</Button>
            {editing ? (
              <Button textColor="#B84A3A" onPress={() => removePlayer(editing.id)}>
                Delete
              </Button>
            ) : null}
            <PrimaryButton loading={saving} disabled={saving} onPress={() => formRef.current?.submit()}>
              {editing ? 'Save player' : 'Create player'}
            </PrimaryButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dialogScrollArea: { maxHeight: 420 },
  dialogScrollContent: { paddingVertical: 8 }
});
