export type PlayerPosition =
  | 'setter'
  | 'outside_hitter'
  | 'opposite'
  | 'middle_blocker'
  | 'libero'
  | 'flexible';

export type Player = {
  id: string;
  ownerId?: string;
  name: string;
  photoUrl?: string | null;
  position: PlayerPosition;
  rating: number;
  isPlaying: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamPlayer = Player & {
  ratingAtGeneration: number;
  positionAtGeneration: PlayerPosition;
};

export type Team = {
  id: string;
  name: string;
  color: string;
  players: TeamPlayer[];
};

export type TeamBalanceMetrics = {
  totalSkillDifference: number;
  averageSkillDifference: number;
  positionalImbalance: number;
  teamSizeDifference: number;
  overallBalanceScore: number;
  confidenceLabel: 'Excellent' | 'Good' | 'Fair' | 'Needs review';
};

export type TeamGeneration = {
  id: string;
  teamCount: number;
  playerCount: number;
  createdAt: string;
  balanceScore: number;
  teams: Team[];
  finalizedAt?: string;
};

export type TeamCountValidation = {
  valid: boolean;
  message: string;
  approximatePlayersPerTeam: string;
};
