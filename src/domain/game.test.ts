import { buildRound, isGameOver, winningTeam, aggregateTichuStats } from './game';
import type { CompletedRound } from '../types';

// buildRound
describe('buildRound', () => {
  it('snaps slider to nearest 5', () => {
    const r = buildRound(1, 63, false, 'A', []);
    expect(r.teamACardPoints).toBe(65);
    expect(r.teamBCardPoints).toBe(35);
  });

  it('card points sum to 100', () => {
    const r = buildRound(1, 40, false, 'A', []);
    expect(r.teamACardPoints + r.teamBCardPoints).toBe(100);
  });

  it('sets card points to 0 for double victory', () => {
    const r = buildRound(1, 80, true, 'B', []);
    expect(r.teamACardPoints).toBe(0);
    expect(r.teamBCardPoints).toBe(0);
    expect(r.isDoubleVictory).toBe(true);
    expect(r.doubleVictoryTeam).toBe('B');
  });

  it('deep-copies tichu events so mutations do not affect the snapshot', () => {
    const events = [{ playerId: 1, isGrand: false, won: true, team: 'A' as const }];
    const r = buildRound(1, 50, false, 'A', events);
    events[0].playerId = 99; // mutate source
    expect(r.tichuEvents[0].playerId).toBe(1); // snapshot unaffected
  });
});

// isGameOver
describe('isGameOver', () => {
  it('returns false below 1000', () => {
    expect(isGameOver(999, 800)).toBe(false);
  });

  it('returns true when team A reaches 1000', () => {
    expect(isGameOver(1000, 400)).toBe(true);
  });

  it('returns true when team B reaches 1000', () => {
    expect(isGameOver(600, 1200)).toBe(true);
  });

  it('returns false when both teams reach 1000', () => {
    expect(isGameOver(1000, 1000)).toBe(false);
  });
});

// winningTeam
describe('winningTeam', () => {
  it('returns A when team A has more points', () => {
    expect(winningTeam(800, 600)).toBe('A');
  });

  it('returns B when team B has more points', () => {
    expect(winningTeam(600, 800)).toBe('B');
  });
});

// aggregateTichuStats
describe('aggregateTichuStats', () => {
  const ANNA = 1;
  const BOB  = 2;

  const rounds: CompletedRound[] = [
    {
      roundNumber: 1,
      teamACardPoints: 50, teamBCardPoints: 50,
      isDoubleVictory: false, doubleVictoryTeam: 'A',
      tichuEvents: [
        { playerId: ANNA, isGrand: false, won: true,  team: 'A' },
        { playerId: BOB,  isGrand: true,  won: false, team: 'A' },
      ],
    },
    {
      roundNumber: 2,
      teamACardPoints: 60, teamBCardPoints: 40,
      isDoubleVictory: false, doubleVictoryTeam: 'A',
      tichuEvents: [
        { playerId: ANNA, isGrand: false, won: false, team: 'A' },
      ],
    },
  ];

  it('counts tichu calls and wins for a player', () => {
    const stats = aggregateTichuStats(ANNA, rounds);
    expect(stats.tichuCalls).toBe(2);
    expect(stats.tichuWins).toBe(1);
    expect(stats.grandCalls).toBe(0);
    expect(stats.grandWins).toBe(0);
  });

  it('counts grand tichu separately', () => {
    const stats = aggregateTichuStats(BOB, rounds);
    expect(stats.tichuCalls).toBe(0);
    expect(stats.grandCalls).toBe(1);
    expect(stats.grandWins).toBe(0);
  });

  it('matches by id — different ids are never confused', () => {
    const statsAnna = aggregateTichuStats(ANNA, rounds);
    const statsBob  = aggregateTichuStats(BOB, rounds);
    expect(statsAnna.tichuCalls).toBe(2);
    expect(statsBob.tichuCalls).toBe(0);
  });

  it('returns zeros for a player with no events', () => {
    const stats = aggregateTichuStats(999, rounds);
    expect(stats).toEqual({ tichuCalls: 0, tichuWins: 0, grandCalls: 0, grandWins: 0 });
  });
});
