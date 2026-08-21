import { Team, TeamGeneration } from '@/types/domain';
import { requireSupabaseConfig, supabase } from './supabase';
import { isSupabaseConfigured } from './env';
import { sqliteSaveTeamGeneration } from './sqlite';

export async function saveTeamGeneration(
  ownerId: string,
  teamCount: number,
  balanceScore: number,
  teams: Team[]
): Promise<TeamGeneration> {
  if (!isSupabaseConfigured) {
    return sqliteSaveTeamGeneration(ownerId, teamCount, balanceScore, teams);
  }
  requireSupabaseConfig();
  const playerCount = teams.reduce((sum, team) => sum + team.players.length, 0);
  const { data: generation, error } = await supabase
    .from('team_generations')
    .insert({ owner_id: ownerId, team_count: teamCount, player_count: playerCount, balance_score: balanceScore })
    .select('*')
    .single();
  if (error) throw error;

  for (let index = 0; index < teams.length; index += 1) {
    const team = teams[index];
    const { data: teamRow, error: teamError } = await supabase
      .from('teams')
      .insert({ generation_id: generation.id, team_number: index + 1, name: team.name, color: team.color })
      .select('*')
      .single();
    if (teamError) throw teamError;

    const rows = team.players.map((player) => ({
      team_id: teamRow.id,
      player_id: player.id,
      rating_at_generation: player.ratingAtGeneration,
      position_at_generation: player.positionAtGeneration
    }));
    if (rows.length) {
      const { error: playersError } = await supabase.from('team_players').insert(rows);
      if (playersError) throw playersError;
    }
  }

  return {
    id: generation.id,
    teamCount,
    playerCount,
    createdAt: generation.created_at,
    balanceScore,
    teams,
    finalizedAt: generation.created_at
  };
}
