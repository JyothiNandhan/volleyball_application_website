import { create } from 'zustand';

import { evaluateTeams, generateBalancedTeams } from '@/algorithms/teamBalance';
import { saveTeamGeneration } from '@/services/teamService';
import { Player, Team, TeamBalanceMetrics, TeamGeneration } from '@/types/domain';

type TeamState = {
  teams: Team[];
  metrics: TeamBalanceMetrics | null;
  generation: TeamGeneration | null;
  generating: boolean;
  saving: boolean;
  error: string | null;
  generate: (players: Player[], teamCount: number) => void;
  movePlayer: (playerId: string, fromTeamId: string, toTeamId: string) => void;
  finalize: (ownerId: string) => Promise<void>;
};

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  metrics: null,
  generation: null,
  generating: false,
  saving: false,
  error: null,
  generate: (players, teamCount) => {
    set({ generating: true, error: null });
    try {
      const teams = generateBalancedTeams(players, teamCount);
      set({ teams, metrics: evaluateTeams(teams), generating: false, generation: null });
    } catch (error) {
      set({ generating: false, error: error instanceof Error ? error.message : 'Could not create teams.' });
    }
  },
  movePlayer: (playerId, fromTeamId, toTeamId) => {
    const teams = get().teams.map((team) => ({ ...team, players: [...team.players] }));
    const from = teams.find((team) => team.id === fromTeamId);
    const to = teams.find((team) => team.id === toTeamId);
    const player = from?.players.find((item) => item.id === playerId);
    if (!from || !to || !player) return;
    from.players = from.players.filter((item) => item.id !== playerId);
    to.players.push(player);
    set({ teams, metrics: evaluateTeams(teams), generation: null });
  },
  finalize: async (ownerId) => {
    const { teams, metrics } = get();
    if (!metrics || teams.length === 0) return;
    set({ saving: true, error: null });
    try {
      const generation = await saveTeamGeneration(ownerId, teams.length, metrics.overallBalanceScore, teams);
      set({ saving: false, generation });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not finalize teams.' });
    }
  }
}));
