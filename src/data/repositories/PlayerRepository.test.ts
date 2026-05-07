import type { SQLiteDatabase } from 'expo-sqlite';
import type { CompletedRound, Player } from '../../types';
import {
  getAllPlayers,
  getPlayerById,
  findOrCreatePlayer,
  saveGameResult,
} from './PlayerRepository';

// PlayerRepository test fixtures.
function makeMockDb(overrides: Partial<SQLiteDatabase> = {}): SQLiteDatabase {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue(undefined),
    execAsync: jest.fn().mockResolvedValue(undefined),
    withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
    ...overrides,
  } as unknown as SQLiteDatabase;
}

function makeRow(overrides: Record<string, number | string> = {}): Record<string, number | string> {
  return {
    id: 1,
    display_name: 'Anna',
    normalized_name: 'anna',
    games_played: 10,
    games_won: 6,
    tichu_calls: 4,
    tichu_wins: 3,
    grand_tichu_calls: 2,
    grand_tichu_wins: 1,
    total_score: 9500,
    ...overrides,
  };
}

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    displayName: 'Anna',
    normalizedName: 'anna',
    gamesPlayed: 10,
    gamesWon: 6,
    tichuCalls: 4,
    tichuWins: 3,
    grandTichuCalls: 2,
    grandTichuWins: 1,
    totalScore: 9500,
    ...overrides,
  };
}

const NO_ROUNDS: CompletedRound[] = [];

// getAllPlayers
describe('getAllPlayers', () => {
  it('executes the correct SQL', async () => {
    const db = makeMockDb();
    await getAllPlayers(db);
    expect(db.getAllAsync).toHaveBeenCalledWith('SELECT * FROM players ORDER BY display_name ASC');
  });

  it('returns an empty array when there are no players', async () => {
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue([]) });
    expect(await getAllPlayers(db)).toEqual([]);
  });

  it('maps a single row to a Player object', async () => {
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue([makeRow()]) });
    const players = await getAllPlayers(db);

    expect(players).toHaveLength(1);
    expect(players[0]).toEqual({
      id: 1,
      displayName: 'Anna',
      normalizedName: 'anna',
      gamesPlayed: 10,
      gamesWon: 6,
      tichuCalls: 4,
      tichuWins: 3,
      grandTichuCalls: 2,
      grandTichuWins: 1,
      totalScore: 9500,
    });
  });

  it('maps multiple rows and preserves order returned by the database', async () => {
    const db = makeMockDb({
      getAllAsync: jest
        .fn()
        .mockResolvedValue([
          makeRow({ id: 1, display_name: 'Anna', normalized_name: 'anna' }),
          makeRow({ id: 2, display_name: 'Bob', normalized_name: 'bob' }),
        ]),
    });
    const players = await getAllPlayers(db);

    expect(players).toHaveLength(2);
    expect(players[0].displayName).toBe('Anna');
    expect(players[1].displayName).toBe('Bob');
  });
});

// getPlayerById
describe('getPlayerById', () => {
  it('executes the correct SQL with the given id', async () => {
    const db = makeMockDb();
    await getPlayerById(db, 42);
    expect(db.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM players WHERE id = ?', [42]);
  });

  it('returns null when no player is found', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    expect(await getPlayerById(db, 99)).toBeNull();
  });

  it('maps the row to a Player object when found', async () => {
    const db = makeMockDb({
      getFirstAsync: jest
        .fn()
        .mockResolvedValue(
          makeRow({ id: 7, display_name: 'Bob', normalized_name: 'bob', total_score: 1800 })
        ),
    });
    const player = await getPlayerById(db, 7);

    expect(player).not.toBeNull();
    expect(player?.id).toBe(7);
    expect(player?.displayName).toBe('Bob');
    expect(player?.totalScore).toBe(1800);
  });
});

// findOrCreatePlayer
describe('findOrCreatePlayer', () => {
  it('inserts with INSERT OR IGNORE before selecting', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue(makeRow()),
    });
    await findOrCreatePlayer(db, 'Anna');

    expect(db.runAsync).toHaveBeenCalledTimes(1);
    const [sql, params] = (db.runAsync as jest.Mock).mock.calls[0];
    expect(sql).toContain('INSERT OR IGNORE');
    expect(params[0]).toBe('Anna'); // display_name
    expect(params[1]).toBe('anna'); // normalized_name
  });

  it('selects by normalized name after the insert', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue(makeRow()),
    });
    await findOrCreatePlayer(db, 'Anna');

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT * FROM players WHERE normalized_name = ?',
      ['anna']
    );
  });

  it('returns the resolved Player with a valid id', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue(makeRow({ id: 5 })),
    });
    const player = await findOrCreatePlayer(db, 'Anna');

    expect(player.id).toBe(5);
    expect(player.displayName).toBe('Anna');
  });

  it('normalizes the lookup key — trims and lowercases', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue(makeRow()),
    });
    await findOrCreatePlayer(db, '  Anna  ');

    const insertParams = (db.runAsync as jest.Mock).mock.calls[0][1];
    expect(insertParams[0]).toBe('  Anna  '); // display_name preserved
    expect(insertParams[1]).toBe('anna'); // normalized_name trimmed + lowercased
  });

  it('starts all stats at zero for a new player', async () => {
    const db = makeMockDb({
      getFirstAsync: jest
        .fn()
        .mockResolvedValue(
          makeRow({
            games_played: 0,
            games_won: 0,
            tichu_calls: 0,
            tichu_wins: 0,
            grand_tichu_calls: 0,
            grand_tichu_wins: 0,
            total_score: 0,
          })
        ),
    });
    const player = await findOrCreatePlayer(db, 'NewPlayer');

    expect(player.gamesPlayed).toBe(0);
    expect(player.totalScore).toBe(0);
  });
});

// saveGameResult
describe('saveGameResult', () => {
  const anna = makePlayer({ id: 1, displayName: 'Anna' });
  const bob = makePlayer({ id: 2, displayName: 'Bob' });
  const carol = makePlayer({ id: 3, displayName: 'Carol' });
  const dave = makePlayer({ id: 4, displayName: 'Dave' });

  it('wraps all writes in a single transaction', async () => {
    const db = makeMockDb();
    await saveGameResult(db, [anna, bob], [carol, dave], 1050, 800, 'A', NO_ROUNDS);
    expect(db.withTransactionAsync).toHaveBeenCalledTimes(1);
  });

  it('writes one UPDATE per player — four total', async () => {
    const db = makeMockDb();
    await saveGameResult(db, [anna, bob], [carol, dave], 1050, 800, 'A', NO_ROUNDS);
    expect(db.runAsync).toHaveBeenCalledTimes(4);
  });

  it('UPDATE targets the player by id, not by name', async () => {
    const db = makeMockDb();
    await saveGameResult(db, [anna, bob], [carol, dave], 1050, 800, 'A', NO_ROUNDS);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    expect(calls[0][0]).toContain('WHERE id = ?'); // SQL uses id
    expect(calls[0][1].at(-1)).toBe(anna.id); // last param is the id
  });

  it('passes team A score to team A players', async () => {
    const db = makeMockDb();
    await saveGameResult(db, [anna, bob], [carol, dave], 1050, 800, 'A', NO_ROUNDS);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    // params: [won, tichuCalls, tichuWins, grandCalls, grandWins, score, id]
    expect(calls[0][1][5]).toBe(1050); // Anna — team A score
    expect(calls[2][1][5]).toBe(800); // Carol — team B score
  });

  it('marks winning team as won=1 and losing team as won=0', async () => {
    const db = makeMockDb();
    await saveGameResult(db, [anna, bob], [carol, dave], 1050, 800, 'A', NO_ROUNDS);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    expect(calls[0][1][0]).toBe(1); // Anna won
    expect(calls[2][1][0]).toBe(0); // Carol lost
  });

  it('marks team B players as won when team B wins', async () => {
    const db = makeMockDb();
    await saveGameResult(db, [anna, bob], [carol, dave], 800, 1050, 'B', NO_ROUNDS);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    expect(calls[0][1][0]).toBe(0); // Anna lost
    expect(calls[2][1][0]).toBe(1); // Carol won
  });

  it('aggregates tichu stats from rounds for each player', async () => {
    const rounds: CompletedRound[] = [
      {
        roundNumber: 1,
        teamACardPoints: 60,
        teamBCardPoints: 40,
        isDoubleVictory: false,
        doubleVictoryTeam: 'A',
        tichuEvents: [
          { playerId: anna.id, isGrand: false, won: true, team: 'A' },
          { playerId: anna.id, isGrand: true, won: false, team: 'A' },
        ],
      },
    ];

    const db = makeMockDb();
    await saveGameResult(db, [anna, bob], [carol, dave], 1050, 800, 'A', rounds);

    const annaParams = (db.runAsync as jest.Mock).mock.calls[0][1];
    // params: [won, tichuCalls, tichuWins, grandCalls, grandWins, score, id]
    expect(annaParams[1]).toBe(1); // tichuCalls
    expect(annaParams[2]).toBe(1); // tichuWins
    expect(annaParams[3]).toBe(1); // grandCalls
    expect(annaParams[4]).toBe(0); // grandWins
  });
});
