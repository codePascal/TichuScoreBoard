import React from 'react';
import type { Decorator } from '@storybook/react';
import { useGameStore, STORE_INITIAL_STATE } from '../store/gameStore';
import { ANNA, BOB, CAROL, DAVE, ROUNDS_SHORT, ROUNDS_WITH_DOUBLE } from './fixtures';

// ---------------------------------------------------------------------------
// Pre-built store states
// ---------------------------------------------------------------------------

/** Store state for a game that is currently in progress. */
export const MID_GAME_STATE = {
  teamAPlayer1: ANNA.displayName,
  teamAPlayer2: BOB.displayName,
  teamBPlayer1: CAROL.displayName,
  teamBPlayer2: DAVE.displayName,
  teamAPlayer1Id: ANNA.id,
  teamAPlayer2Id: BOB.id,
  teamBPlayer1Id: CAROL.id,
  teamBPlayer2Id: DAVE.id,
  teamAScore: 420,
  teamBScore: 310,
  phase: 'playing' as const,
  rounds: ROUNDS_SHORT,
  sliderValue: 50,
  isDoubleVictory: false,
  doubleVictoryTeam: 'A' as const,
  pendingTichuEvents: [],
};

/** Store state for a finished game (team A wins). */
export const FINISHED_GAME_STATE = {
  ...MID_GAME_STATE,
  teamAScore: 1050,
  teamBScore: 800,
  phase: 'finished' as const,
  rounds: ROUNDS_WITH_DOUBLE,
};

/** Store state for a near-finish game (exciting finish). */
export const NEAR_FINISH_STATE = {
  ...MID_GAME_STATE,
  teamAScore: 880,
  teamBScore: 950,
  rounds: ROUNDS_WITH_DOUBLE,
};

// ---------------------------------------------------------------------------
// Decorator factory
// ---------------------------------------------------------------------------

/**
 * Resets the Zustand game store to a known state before each story.
 * Usage: `decorators: [withStoreState(MID_GAME_STATE)]`
 */
export function withStoreState(state: Parameters<typeof useGameStore.setState>[0]): Decorator {
  return (Story) => {
    // Full replace: STORE_INITIAL_STATE carries all function references, story
    // data fields override the defaults. This survives HMR and fresh module loads.
    useGameStore.setState({ ...STORE_INITIAL_STATE, ...state }, true);
    return <Story />;
  };
}
