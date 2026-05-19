import { create } from 'zustand';
import type { CompletedRound, Player, TichuEvent, Team } from '../types';
import { computeRoundTeamTotal, buildRound, isGameOver, winningTeam } from '../domain';
import * as Haptics from 'expo-haptics';

type GamePhase = 'setup' | 'playing' | 'finished';

interface GameStore {
  // Player names (editable during setup; set from Player.displayName on startGame)
  teamAPlayer1: string;
  teamAPlayer2: string;
  teamBPlayer1: string;
  teamBPlayer2: string;

  // Player IDs — null until startGame resolves them from the database
  teamAPlayer1Id: number | null;
  teamAPlayer2Id: number | null;
  teamBPlayer1Id: number | null;
  teamBPlayer2Id: number | null;

  // Game state
  teamAScore: number;
  teamBScore: number;
  rounds: CompletedRound[];
  phase: GamePhase;

  // Current round input
  sliderValue: number;
  isDoubleVictory: boolean;
  doubleVictoryTeam: Team;
  pendingTichuEvents: TichuEvent[];

  /** Actions */

  // Set property.
  setSetup: (
    field: 'teamAPlayer1' | 'teamAPlayer2' | 'teamBPlayer1' | 'teamBPlayer2',
    value: string
  ) => void;

  // Transitions to playing phase. Caller must resolve players from the DB first.
  startGame: (a1: Player, a2: Player, b1: Player, b2: Player) => void;

  // Set slider value: sliderValue.
  setSlider: (v: number) => void;

  // Toggle double victory boolean: isDoubleVictory.
  toggleDoubleVictory: (on: boolean) => void;

  // Set double victory team: doubleVictoryTeam.
  setDoubleVictoryTeam: (t: Team) => void;

  // Set Tichu event for a player. A player can only have one call at a time.
  setTichu: (playerId: number, team: Team, isGrand: boolean, won: boolean) => void;

  // Build and let user confirm round.
  confirmRound: () => void;

  // Remove the last completed round and revert scores to their previous values.
  undoLastRound: () => void;

  // Reset game to setup phase.
  resetGame: () => void;

  /** Derived helpers (functions so they always read live state) */

  // Get any open Tichu event for a player.
  getTichuEvent: (playerId: number) => TichuEvent | undefined;

  // Resolves a player's display name from their database ID. Returns '?' if not in current game.
  getPlayerDisplayName: (id: number) => string;

  // Get team A name: player names separated by an ampersand.
  getTeamAName: () => string;

  // Get team B name: player names separated by an ampersand.
  getTeamBName: () => string;

  // Get current round number, starting from 1.
  getRoundNumber: () => number;

  // Get winning team identifier: A or B.
  getWinner: () => Team;

  // Get number of points for team A.
  getPreviewA: () => number;

  // Get number of points for team B.
  getPreviewB: () => number;
}

export const useGameStore = create<GameStore>((set, get) => ({
  teamAPlayer1: '',
  teamAPlayer2: '',
  teamBPlayer1: '',
  teamBPlayer2: '',
  teamAPlayer1Id: null,
  teamAPlayer2Id: null,
  teamBPlayer1Id: null,
  teamBPlayer2Id: null,
  teamAScore: 0,
  teamBScore: 0,
  rounds: [],
  phase: 'setup',
  sliderValue: 50,
  isDoubleVictory: false,
  doubleVictoryTeam: 'A',
  pendingTichuEvents: [],

  setSetup: (field, value) => set({ [field]: value }),

  startGame: (a1, a2, b1, b2) =>
    set({
      teamAPlayer1: a1.displayName,
      teamAPlayer2: a2.displayName,
      teamBPlayer1: b1.displayName,
      teamBPlayer2: b2.displayName,
      teamAPlayer1Id: a1.id,
      teamAPlayer2Id: a2.id,
      teamBPlayer1Id: b1.id,
      teamBPlayer2Id: b2.id,
      teamAScore: 0,
      teamBScore: 0,
      rounds: [],
      phase: 'playing',
      sliderValue: 50,
      isDoubleVictory: false,
      doubleVictoryTeam: 'A',
      pendingTichuEvents: [],
    }),

  setSlider: (v) => set({ sliderValue: v }),

  toggleDoubleVictory: (on) => set({ isDoubleVictory: on, sliderValue: on ? 0 : 50 }),

  setDoubleVictoryTeam: (t) => set({ doubleVictoryTeam: t }),

  setTichu: (playerId, team, isGrand, won) => {
    const existing = get().pendingTichuEvents.find((e) => e.playerId === playerId);
    const sameState = existing?.isGrand === isGrand && existing?.won === won;

    set((state) => ({
      pendingTichuEvents: sameState
        ? state.pendingTichuEvents.filter((e) => e.playerId !== playerId)
        : [
            ...state.pendingTichuEvents.filter((e) => e.playerId !== playerId),
            { playerId, isGrand, won, team },
          ],
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  confirmRound: () => {
    const s = get();
    const round = buildRound(
      s.rounds.length + 1,
      s.sliderValue,
      s.isDoubleVictory,
      s.doubleVictoryTeam,
      s.pendingTichuEvents
    );

    const newA = s.teamAScore + computeRoundTeamTotal(round, 'A');
    const newB = s.teamBScore + computeRoundTeamTotal(round, 'B');
    const finished = isGameOver(newA, newB);

    set({
      rounds: [...s.rounds, round],
      teamAScore: newA,
      teamBScore: newB,
      phase: finished ? 'finished' : 'playing',
      sliderValue: 50,
      isDoubleVictory: false,
      doubleVictoryTeam: 'A',
      pendingTichuEvents: [],
    });

    if (finished) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  undoLastRound: () => {
    const s = get();
    if (s.rounds.length === 0) return;
    const last = s.rounds[s.rounds.length - 1];
    set({
      rounds: s.rounds.slice(0, -1),
      teamAScore: s.teamAScore - computeRoundTeamTotal(last, 'A'),
      teamBScore: s.teamBScore - computeRoundTeamTotal(last, 'B'),
      phase: 'playing',
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  resetGame: () =>
    set({
      teamAPlayer1: '',
      teamAPlayer2: '',
      teamBPlayer1: '',
      teamBPlayer2: '',
      teamAPlayer1Id: null,
      teamAPlayer2Id: null,
      teamBPlayer1Id: null,
      teamBPlayer2Id: null,
      teamAScore: 0,
      teamBScore: 0,
      rounds: [],
      phase: 'setup',
      sliderValue: 50,
      isDoubleVictory: false,
      doubleVictoryTeam: 'A',
      pendingTichuEvents: [],
    }),

  getTichuEvent: (playerId) => get().pendingTichuEvents.find((e) => e.playerId === playerId),

  getPlayerDisplayName: (id) => {
    const s = get();
    if (s.teamAPlayer1Id === id) return s.teamAPlayer1;
    if (s.teamAPlayer2Id === id) return s.teamAPlayer2;
    if (s.teamBPlayer1Id === id) return s.teamBPlayer1;
    if (s.teamBPlayer2Id === id) return s.teamBPlayer2;
    return '?';
  },

  getTeamAName: () => {
    const { teamAPlayer1: a1, teamAPlayer2: a2 } = get();
    return `${a1 || '?'} & ${a2 || '?'}`;
  },

  getTeamBName: () => {
    const { teamBPlayer1: b1, teamBPlayer2: b2 } = get();
    return `${b1 || '?'} & ${b2 || '?'}`;
  },

  getRoundNumber: () => get().rounds.length + 1,

  getWinner: () => winningTeam(get().teamAScore, get().teamBScore),

  getPreviewA: () => {
    const s = get();
    return computeRoundTeamTotal(
      buildRound(0, s.sliderValue, s.isDoubleVictory, s.doubleVictoryTeam, s.pendingTichuEvents),
      'A'
    );
  },

  getPreviewB: () => {
    const s = get();
    return computeRoundTeamTotal(
      buildRound(0, s.sliderValue, s.isDoubleVictory, s.doubleVictoryTeam, s.pendingTichuEvents),
      'B'
    );
  },
}));

/**
 * Full initial store state captured once at module load — includes all action
 * functions and derived helpers. Used by Storybook decorators to guarantee a
 * clean reset that never loses function references.
 */
export const STORE_INITIAL_STATE = useGameStore.getState();
