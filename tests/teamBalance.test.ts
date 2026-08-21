import { evaluateTeams, generateBalancedTeams } from '@/algorithms/teamBalance';
import { Player, PlayerPosition } from '@/types/domain';

const positions: PlayerPosition[] = ['setter', 'outside_hitter', 'middle_blocker', 'libero', 'opposite', 'flexible'];

function players(ratings: number[]): Player[] {
  return ratings.map((rating, index) => ({
    id: `p-${index}`,
    name: `Player ${index}`,
    position: positions[index % positions.length],
    rating,
    isPlaying: true,
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  }));
}

describe('team balancing', () => {
  it('balances the straightforward 5,5,4,4 case', () => {
    const teams = generateBalancedTeams(players([5, 5, 4, 4]), 2);
    const totals = teams.map((team) => team.players.reduce((sum, player) => sum + player.ratingAtGeneration, 0));
    expect(totals.sort()).toEqual([9, 9]);
  });

  it('supports three teams', () => {
    const teams = generateBalancedTeams(players([5, 5, 4, 4, 3, 3, 2, 2, 1]), 3);
    expect(teams).toHaveLength(3);
    expect(evaluateTeams(teams).teamSizeDifference).toBeLessThanOrEqual(1);
  });

  it('handles uneven player counts', () => {
    const teams = generateBalancedTeams(players([5, 5, 5, 4, 4, 4, 3]), 2);
    expect(evaluateTeams(teams).teamSizeDifference).toBe(1);
  });

  it('handles equal ratings', () => {
    const teams = generateBalancedTeams(players(Array(12).fill(3)), 3);
    expect(evaluateTeams(teams).totalSkillDifference).toBe(0);
  });

  it('keeps extreme skill differences reasonable', () => {
    const teams = generateBalancedTeams(players([5, 5, 5, 1, 1, 1]), 2);
    expect(evaluateTeams(teams).totalSkillDifference).toBeLessThanOrEqual(4);
  });

  it('handles missing positions', () => {
    const roster = players([5, 4, 4, 3, 3, 2]).map((player) => ({ ...player, position: 'outside_hitter' as const }));
    expect(generateBalancedTeams(roster, 2)).toHaveLength(2);
  });

  it('handles many players', () => {
    const roster = players(Array.from({ length: 250 }, (_, index) => (index % 5) + 1));
    const teams = generateBalancedTeams(roster, 8);
    expect(teams).toHaveLength(8);
    expect(evaluateTeams(teams).teamSizeDifference).toBeLessThanOrEqual(1);
  });

  it('rejects impossible requests', () => {
    expect(() => generateBalancedTeams(players([5]), 2)).toThrow();
  });
});
