import { CORE_POSITIONS } from '@/constants/positions';
import { TEAM_COLORS } from '@/constants/teamColors';
import { Player, PlayerPosition, Team, TeamBalanceMetrics, TeamPlayer } from '@/types/domain';

const SKILL_WEIGHT = 14;
const AVERAGE_WEIGHT = 9;
const POSITION_WEIGHT = 5;
const SIZE_WEIGHT = 20;
const MAX_RESTARTS = 28;
const MAX_SWAP_PASSES = 80;
const LARGE_ROSTER_THRESHOLD = 80;

export function generateBalancedTeams(players: Player[], teamCount: number): Team[] {
  if (!Number.isInteger(teamCount) || teamCount <= 0) {
    throw new Error('Team count must be a positive integer.');
  }
  if (players.length < teamCount) {
    throw new Error('There must be at least one player per team.');
  }

  let best = createCandidate(players, teamCount, 0);
  let bestMetrics = evaluateTeams(best);

  const restarts = players.length > LARGE_ROSTER_THRESHOLD ? 6 : MAX_RESTARTS;
  for (let seed = 1; seed <= restarts; seed += 1) {
    const candidate = optimizeTeams(createCandidate(players, teamCount, seed));
    const metrics = evaluateTeams(candidate);
    if (metrics.overallBalanceScore < bestMetrics.overallBalanceScore) {
      best = candidate;
      bestMetrics = metrics;
    }
  }

  return best.map((team, index) => ({ ...team, name: team.name || `Team ${index + 1}` }));
}

export function evaluateTeams(teams: Team[]): TeamBalanceMetrics {
  const totals = teams.map(totalSkill);
  const averages = teams.map((team) => (team.players.length ? totalSkill(team) / team.players.length : 0));
  const sizes = teams.map((team) => team.players.length);
  const totalSkillDifference = spread(totals);
  const averageSkillDifference = Number(spread(averages).toFixed(2));
  const teamSizeDifference = spread(sizes);
  const positionalImbalance = calculatePositionImbalance(teams);
  const overallBalanceScore = Number(
    (
      totalSkillDifference * SKILL_WEIGHT +
      averageSkillDifference * AVERAGE_WEIGHT +
      positionalImbalance * POSITION_WEIGHT +
      teamSizeDifference * SIZE_WEIGHT
    ).toFixed(2)
  );

  return {
    totalSkillDifference,
    averageSkillDifference,
    positionalImbalance,
    teamSizeDifference,
    overallBalanceScore,
    confidenceLabel: confidenceLabel(overallBalanceScore, teams.length)
  };
}

function createCandidate(players: Player[], teamCount: number, seed: number): Team[] {
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `Team ${index + 1}`,
    color: TEAM_COLORS[index % TEAM_COLORS.length],
    players: [] as TeamPlayer[]
  }));

  const grouped = groupByPosition(players, seed);
  for (const position of Object.keys(grouped) as PlayerPosition[]) {
    grouped[position].forEach((player, index) => {
      const cycle = Math.floor(index / teamCount);
      const offset = cycle % 2 === 0 ? index % teamCount : teamCount - 1 - (index % teamCount);
      const targetIndex = (offset + seed) % teamCount;
      teams[targetIndex].players.push(toTeamPlayer(player));
    });
  }

  return rebalanceSizes(teams);
}

function optimizeTeams(input: Team[]) {
  let teams = cloneTeams(input);
  let currentScore = evaluateTeams(teams).overallBalanceScore;
  const playerCount = teams.reduce((sum, team) => sum + team.players.length, 0);
  const maxPasses = playerCount > LARGE_ROSTER_THRESHOLD ? 1 : MAX_SWAP_PASSES;

  for (let pass = 0; pass < maxPasses; pass += 1) {
    let improved = false;

    for (let a = 0; a < teams.length; a += 1) {
      for (let b = a + 1; b < teams.length; b += 1) {
        for (let i = 0; i < teams[a].players.length; i += 1) {
          for (let j = 0; j < teams[b].players.length; j += 1) {
            const swapped = swapPlayers(teams, a, i, b, j);
            const score = evaluateTeams(swapped).overallBalanceScore;
            if (score + 0.001 < currentScore) {
              teams = swapped;
              currentScore = score;
              improved = true;
            }
          }
        }
      }
    }

    if (!improved) break;
  }

  return teams;
}

function groupByPosition(players: Player[], seed: number) {
  const result = {} as Record<PlayerPosition, Player[]>;
  for (const player of shuffle(players, seed)) {
    result[player.position] = result[player.position] ?? [];
    result[player.position].push(player);
  }
  for (const position of Object.keys(result) as PlayerPosition[]) {
    result[position].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  }
  return result;
}

function rebalanceSizes(teams: Team[]) {
  const output = cloneTeams(teams);
  while (spread(output.map((team) => team.players.length)) > 1) {
    const largest = output.reduce((best, team, index) =>
      team.players.length > output[best].players.length ? index : best, 0);
    const smallest = output.reduce((best, team, index) =>
      team.players.length < output[best].players.length ? index : best, 0);
    const player = output[largest].players.pop();
    if (player) output[smallest].players.push(player);
  }
  return output;
}

function calculatePositionImbalance(teams: Team[]) {
  let score = 0;
  for (const position of CORE_POSITIONS) {
    const counts = teams.map((team) =>
      team.players.filter((player) => player.positionAtGeneration === position).length
    );
    score += spread(counts);
  }
  return score;
}

function totalSkill(team: Team) {
  return team.players.reduce((sum, player) => sum + player.ratingAtGeneration, 0);
}

function spread(values: number[]) {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

function toTeamPlayer(player: Player): TeamPlayer {
  return {
    ...player,
    ratingAtGeneration: player.rating,
    positionAtGeneration: player.position
  };
}

function swapPlayers(teams: Team[], teamA: number, playerA: number, teamB: number, playerB: number) {
  const output = cloneTeams(teams);
  const left = output[teamA].players[playerA];
  output[teamA].players[playerA] = output[teamB].players[playerB];
  output[teamB].players[playerB] = left;
  return output;
}

function cloneTeams(teams: Team[]) {
  return teams.map((team) => ({ ...team, players: [...team.players] }));
}

function shuffle(players: Player[], seed: number) {
  const output = [...players];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random(seed + i * 17) * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function random(seed: number) {
  const x = Math.sin(seed * 999 + 11) * 10000;
  return x - Math.floor(x);
}

function confidenceLabel(score: number, teamCount: number): TeamBalanceMetrics['confidenceLabel'] {
  if (score <= teamCount * 12) return 'Excellent';
  if (score <= teamCount * 24) return 'Good';
  if (score <= teamCount * 40) return 'Fair';
  return 'Needs review';
}
