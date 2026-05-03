import { playerWinRate, playerTichuRate, playerGrandTichuRate, playerAvgScore } from './player';
import type { Player } from '../types';

// Player test fixtures.
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

// playerWinRate
describe('playerWinRate', () => {
  it('no games played', () => {
    expect(playerWinRate(makePlayer())).toBe(0);
  });

  it('an average player', () => {
    expect(playerWinRate(makePlayer({ gamesPlayed: 4, gamesWon: 3 }))).toBe(75);
  });

  it('an unbeaten player', () => {
    expect(playerWinRate(makePlayer({ gamesPlayed: 5, gamesWon: 5 }))).toBe(100);
  });
});

// playerTichuRate
describe('playerTichuRate', () => {
  it('no games played', () => {
    expect(playerTichuRate(makePlayer())).toBe(0);
  });

  it('an average player', () => {
    expect(playerTichuRate(makePlayer({ tichuCalls: 10, tichuWins: 7 }))).toBeCloseTo(70);
  });

  it('an unbeaten player', () => {
    expect(playerTichuRate(makePlayer({ tichuCalls: 10, tichuWins: 10 }))).toBeCloseTo(100);
  });
});

// playerGrandTichuRate
describe('playerGrandTichuRate', () => {
  it('no games played', () => {
    expect(playerGrandTichuRate(makePlayer())).toBe(0);
  });

  it('an average player', () => {
    expect(
      playerGrandTichuRate(makePlayer({ grandTichuCalls: 10, grandTichuWins: 7 }))
    ).toBeCloseTo(70);
  });

  it('an unbeaten player', () => {
    expect(
      playerGrandTichuRate(makePlayer({ grandTichuCalls: 10, grandTichuWins: 10 }))
    ).toBeCloseTo(100);
  });
});

// playerAvgScore
describe('playerAvgScore', () => {
  it('no games played', () => {
    expect(playerAvgScore(makePlayer())).toBe(0);
  });

  it('an average player', () => {
    expect(playerAvgScore(makePlayer({ gamesPlayed: 10, totalScore: 550 }))).toBeCloseTo(55);
  });

  it('an unbeaten player', () => {
    expect(playerAvgScore(makePlayer({ gamesPlayed: 10, totalScore: 10000 }))).toBeCloseTo(1000);
  });
});
