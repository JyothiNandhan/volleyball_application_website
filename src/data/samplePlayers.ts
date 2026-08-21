import { Player } from '@/types/domain';

const now = new Date().toISOString();

export const samplePlayers: Player[] = [
  ['Maya Thompson', 'setter', 5, true],
  ['Jordan Lee', 'outside_hitter', 5, true],
  ['Ari Patel', 'middle_blocker', 4, true],
  ['Sofia Garcia', 'libero', 4, true],
  ['Noah Kim', 'opposite', 4, true],
  ['Elena Rossi', 'outside_hitter', 3, true],
  ['Marcus Reed', 'middle_blocker', 3, true],
  ['Priya Shah', 'setter', 4, true],
  ['Ethan Brooks', 'libero', 3, true],
  ['Camila Torres', 'outside_hitter', 5, true],
  ['Owen Miller', 'opposite', 2, true],
  ['Lina Chen', 'flexible', 3, true],
  ['Sam Wilson', 'middle_blocker', 4, true],
  ['Nadia Hassan', 'outside_hitter', 2, false],
  ['Diego Alvarez', 'setter', 3, true],
  ['Grace Nguyen', 'libero', 2, false],
  ['Ben Carter', 'opposite', 5, true],
  ['Ivy Martin', 'flexible', 3, true]
].map(([name, position, rating, isPlaying], index) => ({
  id: `sample-${index + 1}`,
  name: String(name),
  position: position as Player['position'],
  rating: Number(rating),
  isPlaying: Boolean(isPlaying),
  notes: null,
  photoUrl: null,
  createdAt: now,
  updatedAt: now
}));
