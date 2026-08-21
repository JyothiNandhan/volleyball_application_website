import { TeamCountValidation } from '@/types/domain';

export const MIN_PLAYERS_PER_TEAM = 2;

export function validateTeamCount(availablePlayers: number, teamCount: number): TeamCountValidation {
  if (!Number.isInteger(teamCount) || teamCount <= 0) {
    return {
      valid: false,
      message: 'Choose at least one team.',
      approximatePlayersPerTeam: '0'
    };
  }

  if (availablePlayers === 0) {
    return {
      valid: false,
      message: 'No players are currently marked as playing.',
      approximatePlayersPerTeam: '0'
    };
  }

  if (teamCount > Math.floor(availablePlayers / MIN_PLAYERS_PER_TEAM)) {
    return {
      valid: false,
      message: `You have ${availablePlayers} available players. Creating ${teamCount} teams would leave some teams too small.`,
      approximatePlayersPerTeam: formatPlayersPerTeam(availablePlayers, teamCount)
    };
  }

  return {
    valid: true,
    message:
      availablePlayers % teamCount === 0
        ? 'Balanced roster size.'
        : 'Teams will have slightly different sizes.',
    approximatePlayersPerTeam: formatPlayersPerTeam(availablePlayers, teamCount)
  };
}

export function recommendedTeamCount(availablePlayers: number) {
  if (availablePlayers < 4) return 1;
  if (availablePlayers <= 14) return 2;
  return Math.max(2, Math.round(availablePlayers / 7));
}

function formatPlayersPerTeam(players: number, teams: number) {
  if (teams <= 0) return '0';
  const low = Math.floor(players / teams);
  const high = Math.ceil(players / teams);
  return low === high ? `${low}` : `${low}-${high}`;
}
