jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

import type { Player } from '../types';
import { useGameStore } from './gameStore';

// gameStore fixtures.
function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    displayName: 'Anna',
    normalizedName: 'anna',
    gamesPlayed: 0,
    gamesWon: 0,
    tichuCalls: 0,
    tichuWins: 0,
    grandTichuCalls: 0,
    grandTichuWins: 0,
    totalScore: 0,
    ...overrides,
  };
}

const P_A1 = makePlayer({ id: 1, displayName: 'Anna', normalizedName: 'anna' });
const P_A2 = makePlayer({ id: 2, displayName: 'Bob',  normalizedName: 'bob'  });
const P_B1 = makePlayer({ id: 3, displayName: 'Carl', normalizedName: 'carl' });
const P_B2 = makePlayer({ id: 4, displayName: 'Dana', normalizedName: 'dana' });

beforeEach(() => {
  useGameStore.getState().resetGame();
});

// startGame
describe('startGame', () => {
  it('switches phase to playing and zeroes scores', () => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);

    const after = useGameStore.getState();
    expect(after.phase).toBe('playing');
    expect(after.teamAScore).toBe(0);
    expect(after.teamBScore).toBe(0);
    expect(after.rounds).toHaveLength(0);
  });

  it('stores player names from the resolved Player objects', () => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);

    const after = useGameStore.getState();
    expect(after.teamAPlayer1).toBe('Anna');
    expect(after.teamAPlayer2).toBe('Bob');
    expect(after.teamBPlayer1).toBe('Carl');
    expect(after.teamBPlayer2).toBe('Dana');
  });

  it('stores the database IDs for all four players', () => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);

    const after = useGameStore.getState();
    expect(after.teamAPlayer1Id).toBe(1);
    expect(after.teamAPlayer2Id).toBe(2);
    expect(after.teamBPlayer1Id).toBe(3);
    expect(after.teamBPlayer2Id).toBe(4);
  });
});

// resetGame
describe('resetGame', () => {
  it('clears player IDs back to null', () => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);
    useGameStore.getState().resetGame();

    const after = useGameStore.getState();
    expect(after.teamAPlayer1Id).toBeNull();
    expect(after.teamBPlayer2Id).toBeNull();
    expect(after.phase).toBe('setup');
  });
});

// setTichu
describe('setTichu', () => {
  it('adds a tichu event', () => {
    useGameStore.getState().setTichu(P_A1.id, 'A', false, true);
    expect(useGameStore.getState().getTichuEvent(P_A1.id)).toMatchObject({
      playerId: P_A1.id,
      isGrand: false,
      won: true,
      team: 'A',
    });
  });

  it('toggles off when the same button is pressed again', () => {
    const s = useGameStore.getState();
    s.setTichu(P_A1.id, 'A', false, true);
    s.setTichu(P_A1.id, 'A', false, true);
    expect(useGameStore.getState().getTichuEvent(P_A1.id)).toBeUndefined();
  });

  it('replaces the event when a different button is pressed for the same player', () => {
    const s = useGameStore.getState();
    s.setTichu(P_A1.id, 'A', false, true);  // Tichu won
    s.setTichu(P_A1.id, 'A', false, false); // Tichu lost
    expect(useGameStore.getState().getTichuEvent(P_A1.id)?.won).toBe(false);
  });

  it('tracks events for different players independently', () => {
    const s = useGameStore.getState();
    s.setTichu(P_A1.id, 'A', false, true);
    s.setTichu(P_B1.id, 'B', true,  true);
    expect(useGameStore.getState().getTichuEvent(P_A1.id)?.team).toBe('A');
    expect(useGameStore.getState().getTichuEvent(P_B1.id)?.isGrand).toBe(true);
  });
});

// confirmRound
describe('confirmRound', () => {
  beforeEach(() => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);
  });

  it('appends a round and updates scores', () => {
    useGameStore.getState().setSlider(60);
    useGameStore.getState().confirmRound();

    const after = useGameStore.getState();
    expect(after.rounds).toHaveLength(1);
    expect(after.teamAScore).toBe(60);
    expect(after.teamBScore).toBe(40);
  });

  it('resets round input after confirming', () => {
    const s = useGameStore.getState();
    s.setSlider(70);
    s.setTichu(P_A1.id, 'A', false, true);
    s.confirmRound();

    const after = useGameStore.getState();
    expect(after.sliderValue).toBe(50);
    expect(after.pendingTichuEvents).toHaveLength(0);
    expect(after.isDoubleVictory).toBe(false);
  });

  it('includes tichu bonuses in scores', () => {
    useGameStore.getState().setSlider(50);
    useGameStore.getState().setTichu(P_A1.id, 'A', false, true); // +100 for team A
    useGameStore.getState().confirmRound();

    expect(useGameStore.getState().teamAScore).toBe(150); // 50 + 100
    expect(useGameStore.getState().teamBScore).toBe(50);
  });

  it('double victory scores 200-0', () => {
    useGameStore.getState().toggleDoubleVictory(true);
    useGameStore.getState().setDoubleVictoryTeam('B');
    useGameStore.getState().confirmRound();

    expect(useGameStore.getState().teamAScore).toBe(0);
    expect(useGameStore.getState().teamBScore).toBe(200);
  });

  it('accumulates scores across multiple rounds', () => {
    useGameStore.getState().setSlider(60); useGameStore.getState().confirmRound(); // A+60 B+40
    useGameStore.getState().setSlider(30); useGameStore.getState().confirmRound(); // A+30 B+70

    expect(useGameStore.getState().teamAScore).toBe(90);
    expect(useGameStore.getState().teamBScore).toBe(110);
  });

  it('sets phase to finished when a team reaches 1000', () => {
    for (let i = 0; i < 5; i++) {
      useGameStore.getState().toggleDoubleVictory(true);
      useGameStore.getState().setDoubleVictoryTeam('A');
      useGameStore.getState().confirmRound();
    }
    expect(useGameStore.getState().phase).toBe('finished');
    expect(useGameStore.getState().teamAScore).toBe(1000);
  });
});

// derived helpers
describe('derived helpers', () => {
  it('getTeamAName joins player names', () => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);
    expect(useGameStore.getState().getTeamAName()).toBe('Anna & Bob');
  });

  it('getRoundNumber is rounds.length + 1', () => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);
    expect(useGameStore.getState().getRoundNumber()).toBe(1);
    useGameStore.getState().confirmRound();
    expect(useGameStore.getState().getRoundNumber()).toBe(2);
  });

  it('getWinner returns the team with the higher score', () => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);
    useGameStore.getState().setSlider(80);
    useGameStore.getState().confirmRound();
    expect(useGameStore.getState().getWinner()).toBe('A');
  });

  it('getPreviewA and getPreviewB reflect current input', () => {
    useGameStore.getState().startGame(P_A1, P_A2, P_B1, P_B2);
    useGameStore.getState().setSlider(60);
    useGameStore.getState().setTichu(P_A1.id, 'A', false, true); // +100 for A
    expect(useGameStore.getState().getPreviewA()).toBe(160);
    expect(useGameStore.getState().getPreviewB()).toBe(40);
  });
});
