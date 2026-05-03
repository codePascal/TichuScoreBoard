import { computeRoundTeamTotal } from './scoring';
import type { CompletedRound } from '../types';

// Scoring test fixtures.
const ANY_ROUND_NUMBER = 1;
const ANY_TEAM_POINTS_A = 30;
const ANY_TEAM_POINTS_B = 70;
const ANY_IS_DOUBLE_VICTORY = false;
const ANY_DOUBLE_VICTORY_TEAM = 'A';
const ANY_PLAYER_NAME = 'Anna';

function makeRound(overrides: Partial<CompletedRound> = {}): CompletedRound {
  return {
    roundNumber: ANY_ROUND_NUMBER,
    teamACardPoints: ANY_TEAM_POINTS_A,
    teamBCardPoints: ANY_TEAM_POINTS_B,
    isDoubleVictory: ANY_IS_DOUBLE_VICTORY,
    doubleVictoryTeam: ANY_DOUBLE_VICTORY_TEAM,
    tichuEvents: [],
    ...overrides,
  };
}

// computeRoundTeamTotal: card points split, no special Tichu events.
describe('computeRoundTeamTotal: card points split, no special Tichu events', () => {
  it('sums to 100 across both teams', () => {
    const round = makeRound({ teamACardPoints: 30, teamBCardPoints: 70 });
    expect(computeRoundTeamTotal(round, 'A') + computeRoundTeamTotal(round, 'B')).toBe(100);
    expect(computeRoundTeamTotal(round, 'A')).toBe(30);
    expect(computeRoundTeamTotal(round, 'B')).toBe(70);
  });

  it('team B made all points', () => {
    const round = makeRound({ teamACardPoints: 0, teamBCardPoints: 100 });
    expect(computeRoundTeamTotal(round, 'A')).toBe(0);
    expect(computeRoundTeamTotal(round, 'B')).toBe(100);
  });

  it('team A made all points except the phoenix (-25 points)', () => {
    const round = makeRound({ teamACardPoints: 125, teamBCardPoints: -25 });
    expect(computeRoundTeamTotal(round, 'A')).toBe(125);
    expect(computeRoundTeamTotal(round, 'B')).toBe(-25);
  });
});

// computeRoundTeamTotal: double victories, no special Tichu events.
describe('computeRoundTeamTotal: double victories, no special Tichu events', () => {
  it('double victory by team A', () => {
    const round = makeRound({ isDoubleVictory: true, doubleVictoryTeam: 'A' });
    expect(computeRoundTeamTotal(round, 'A')).toBe(200);
    expect(computeRoundTeamTotal(round, 'B')).toBe(0);
  });

  it('double victory by team B', () => {
    const round = makeRound({ isDoubleVictory: true, doubleVictoryTeam: 'B' });
    expect(computeRoundTeamTotal(round, 'A')).toBe(0);
    expect(computeRoundTeamTotal(round, 'B')).toBe(200);
  });

  it('apparently no double victory', () => {
    const round = makeRound({ isDoubleVictory: false, doubleVictoryTeam: 'B' });
    expect(computeRoundTeamTotal(round, 'A')).toBe(30);
    expect(computeRoundTeamTotal(round, 'B')).toBe(70);
  });
});

// computeRoundTeamTotal: single Tichu and grand Tichu events
describe('computeRoundTeamTotal: single Tichu and grand Tichu events', () => {
  it('team A made a Tichu', () => {
    const round = makeRound({
      tichuEvents: [{ playerName: ANY_PLAYER_NAME, isGrand: false, won: true, team: 'A' }],
    });
    expect(computeRoundTeamTotal(round, 'A')).toBe(130);
    expect(computeRoundTeamTotal(round, 'B')).toBe(70);
  });

  it('team A failed a Tichu', () => {
    const round = makeRound({
      tichuEvents: [{ playerName: ANY_PLAYER_NAME, isGrand: false, won: false, team: 'A' }],
    });
    expect(computeRoundTeamTotal(round, 'A')).toBe(-70);
    expect(computeRoundTeamTotal(round, 'B')).toBe(70);
  });

  it('team B made a grand Tichu', () => {
    const round = makeRound({
      tichuEvents: [{ playerName: ANY_PLAYER_NAME, isGrand: true, won: true, team: 'B' }],
    });
    expect(computeRoundTeamTotal(round, 'A')).toBe(30);
    expect(computeRoundTeamTotal(round, 'B')).toBe(270);
  });

  it('team B failed a grand Tichu', () => {
    const round = makeRound({
      tichuEvents: [{ playerName: ANY_PLAYER_NAME, isGrand: true, won: false, team: 'B' }],
    });
    expect(computeRoundTeamTotal(round, 'A')).toBe(30);
    expect(computeRoundTeamTotal(round, 'B')).toBe(-130);
  });

  it('double victory by team A but Tichu call by team B', () => {
    const round = makeRound({
      isDoubleVictory: true,
      doubleVictoryTeam: 'A',
      tichuEvents: [{ playerName: ANY_PLAYER_NAME, isGrand: false, won: false, team: 'B' }],
    });
    expect(computeRoundTeamTotal(round, 'A')).toBe(200);
    expect(computeRoundTeamTotal(round, 'B')).toBe(-100);
  });
});

// computeRoundTeamTotal: stacked Tichu and grand Tichu events
describe('computeRoundTeamTotal: stacked Tichu and grand Tichu events', () => {
  it('both teams made Tichu calls but only team A succeeded', () => {
    const round = makeRound({
      tichuEvents: [
        { playerName: ANY_PLAYER_NAME, isGrand: false, won: true, team: 'A' },
        { playerName: ANY_PLAYER_NAME, isGrand: false, won: false, team: 'B' },
      ],
    });
    expect(computeRoundTeamTotal(round, 'A')).toBe(130);
    expect(computeRoundTeamTotal(round, 'B')).toBe(-30);
  });

  it('both players from team A accidentally made Tichu calls and failed heroically', () => {
    const round = makeRound({
      tichuEvents: [
        { playerName: ANY_PLAYER_NAME, isGrand: false, won: false, team: 'A' },
        { playerName: ANY_PLAYER_NAME, isGrand: false, won: false, team: 'A' },
      ],
    });
    expect(computeRoundTeamTotal(round, 'A')).toBe(-170);
    expect(computeRoundTeamTotal(round, 'B')).toBe(70);
  });
});
