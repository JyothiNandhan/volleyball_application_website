import { Player } from '@/types/domain';

export function useRosterStats(players: Player[]) {
  const total = players.length;
  const playing = players.filter((player) => player.isPlaying).length;
  const notPlaying = total - playing;
  const averageRating = total
    ? (players.reduce((sum, player) => sum + player.rating, 0) / total).toFixed(1)
    : '0.0';
  return { total, playing, notPlaying, averageRating };
}
