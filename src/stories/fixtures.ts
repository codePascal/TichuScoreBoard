import type { Player, CompletedRound } from '../types';

// ---------------------------------------------------------------------------
// Fake players
// ---------------------------------------------------------------------------

export const ANNA: Player = {
  id: 1,
  displayName: 'Anna',
  normalizedName: 'anna',
  gamesPlayed: 24,
  gamesWon: 16,
  tichuCalls: 18,
  tichuWins: 13,
  grandTichuCalls: 5,
  grandTichuWins: 3,
  totalScore: 25200,
};

export const BOB: Player = {
  id: 2,
  displayName: 'Bob',
  normalizedName: 'bob',
  gamesPlayed: 20,
  gamesWon: 11,
  tichuCalls: 14,
  tichuWins: 9,
  grandTichuCalls: 3,
  grandTichuWins: 1,
  totalScore: 19800,
};

export const CAROL: Player = {
  id: 3,
  displayName: 'Carol',
  normalizedName: 'carol',
  gamesPlayed: 18,
  gamesWon: 10,
  tichuCalls: 12,
  tichuWins: 8,
  grandTichuCalls: 4,
  grandTichuWins: 2,
  totalScore: 17500,
};

export const DAVE: Player = {
  id: 4,
  displayName: 'Dave',
  normalizedName: 'dave',
  gamesPlayed: 15,
  gamesWon: 6,
  tichuCalls: 10,
  tichuWins: 5,
  grandTichuCalls: 2,
  grandTichuWins: 0,
  totalScore: 13200,
};

export const NEW_PLAYER: Player = {
  id: 5,
  displayName: 'Newbie',
  normalizedName: 'newbie',
  gamesPlayed: 0,
  gamesWon: 0,
  tichuCalls: 0,
  tichuWins: 0,
  grandTichuCalls: 0,
  grandTichuWins: 0,
  totalScore: 0,
};

export const ALL_PLAYERS = [ANNA, BOB, CAROL, DAVE, NEW_PLAYER];

// ---------------------------------------------------------------------------
// Fake rounds
// ---------------------------------------------------------------------------

export const ROUNDS_SHORT: CompletedRound[] = [
  {
    roundNumber: 1,
    teamACardPoints: 70,
    teamBCardPoints: 30,
    isDoubleVictory: false,
    doubleVictoryTeam: 'A',
    tichuEvents: [],
  },
  {
    roundNumber: 2,
    teamACardPoints: 40,
    teamBCardPoints: 60,
    isDoubleVictory: false,
    doubleVictoryTeam: 'A',
    tichuEvents: [{ playerId: ANNA.id, isGrand: false, won: true, team: 'A' }],
  },
];

export const ROUNDS_WITH_DOUBLE: CompletedRound[] = [
  ...ROUNDS_SHORT,
  {
    roundNumber: 3,
    teamACardPoints: 0,
    teamBCardPoints: 0,
    isDoubleVictory: true,
    doubleVictoryTeam: 'A',
    tichuEvents: [{ playerId: ANNA.id, isGrand: true, won: true, team: 'A' }],
  },
];
