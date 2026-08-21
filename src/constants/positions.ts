import { PlayerPosition } from '@/types/domain';

export const PLAYER_POSITIONS: { label: string; value: PlayerPosition; shortLabel: string }[] = [
  { label: 'Setter', value: 'setter', shortLabel: 'S' },
  { label: 'Outside Hitter', value: 'outside_hitter', shortLabel: 'OH' },
  { label: 'Opposite', value: 'opposite', shortLabel: 'OPP' },
  { label: 'Middle Blocker', value: 'middle_blocker', shortLabel: 'MB' },
  { label: 'Libero', value: 'libero', shortLabel: 'L' },
  { label: 'Any / Flexible', value: 'flexible', shortLabel: 'Any' }
];

export const positionLabel = (position: PlayerPosition) =>
  PLAYER_POSITIONS.find((item) => item.value === position)?.label ?? 'Flexible';

export const CORE_POSITIONS: PlayerPosition[] = [
  'setter',
  'middle_blocker',
  'outside_hitter',
  'opposite',
  'libero'
];
