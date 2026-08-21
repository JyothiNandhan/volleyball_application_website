import { create } from 'zustand';

import * as playerService from '@/services/playerService';
import { Player } from '@/types/domain';
import { PlayerInput } from '@/validation/player';

type PlayerState = {
  players: Player[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadPlayers: (ownerId: string) => Promise<void>;
  addPlayer: (ownerId: string, input: PlayerInput) => Promise<void>;
  updatePlayer: (id: string, input: PlayerInput) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  players: [],
  loading: false,
  saving: false,
  error: null,
  loadPlayers: async (ownerId) => {
    set({ loading: true, error: null });
    try {
      const players = await playerService.fetchPlayers(ownerId);
      set({ players, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Could not load players.' });
    }
  },
  addPlayer: async (ownerId, input) => {
    set({ saving: true, error: null });
    try {
      const player = await playerService.createPlayer(ownerId, input);
      set({ players: [...get().players, player].sort((a, b) => a.name.localeCompare(b.name)), saving: false });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not save player.' });
    }
  },
  updatePlayer: async (id, input) => {
    set({ saving: true, error: null });
    try {
      const player = await playerService.updatePlayer(id, input);
      set({ players: get().players.map((item) => (item.id === id ? player : item)), saving: false });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not update player.' });
    }
  },
  removePlayer: async (id) => {
    set({ saving: true, error: null });
    try {
      await playerService.deletePlayer(id);
      set({ players: get().players.filter((player) => player.id !== id), saving: false });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not delete player.' });
    }
  }
}));
