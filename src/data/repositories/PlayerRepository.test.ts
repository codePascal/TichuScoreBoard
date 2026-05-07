import type { SQLiteDatabase } from 'expo-sqlite';
import type { CompletedRound } from '../../types';
import { getAllPlayers, getPlayerById, saveGameResult } from './PlayerRepository';


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

const NO_ROUNDS: CompletedRound[] = [];


// getAllPlayers
describe('getAllPlayers', () => {
  it('executes the correct SQL', async () => {
    const db = makeMockDb();
    await getAllPlayers(db);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM players ORDER BY display_name ASC'
    );
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
      getAllAsync: jest.fn().mockResolvedValue([
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
    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT * FROM players WHERE id = ?',
      [42]
    );
  });

  it('returns null when no player is found', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    expect(await getPlayerById(db, 99)).toBeNull();
  });

  it('maps the row to a Player object when found', async () => {
    const db = makeMockDb({
      getFirstAsync: jest.fn().mockResolvedValue(
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

// saveGameResult
describe('saveGameResult', () => {
  it('wraps all writes in a single transaction', async () => {
    const db = makeMockDb();
    await saveGameResult(db, ['Anna', 'Bob'], ['Carol', 'Dave'], 1050, 800, 'A', NO_ROUNDS);
    expect(db.withTransactionAsync).toHaveBeenCalledTimes(1);
  });

  it('writes one row per player — four total', async () => {
    const db = makeMockDb();
    await saveGameResult(db, ['Anna', 'Bob'], ['Carol', 'Dave'], 1050, 800, 'A', NO_ROUNDS);
    expect(db.runAsync).toHaveBeenCalledTimes(4);
  });

  it('passes score of team A to team A players', async () => {
    const db = makeMockDb();
    await saveGameResult(db, ['Anna', 'Bob'], ['Carol', 'Dave'], 1050, 800, 'A', NO_ROUNDS);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    // 3rd positional arg in the params array is the score (index 7 in the VALUES list)
    const [annaParams] = calls[0].slice(1); // second arg to runAsync is the params array
    const [carolParams] = calls[2].slice(1);

    expect(annaParams[7]).toBe(1050); // team A score
    expect(carolParams[7]).toBe(800); // team B score
  });

  it('marks winning team players as won=1 and losing team as won=0', async () => {
    const db = makeMockDb();
    await saveGameResult(db, ['Anna', 'Bob'], ['Carol', 'Dave'], 1050, 800, 'A', NO_ROUNDS);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    const annaWon = calls[0][1][2];  // params[2] = won flag for Anna
    const carolWon = calls[2][1][2]; // params[2] = won flag for Carol

    expect(annaWon).toBe(1);  // team A won
    expect(carolWon).toBe(0); // team B lost
  });

  it('marks team B players as won when team B wins', async () => {
    const db = makeMockDb();
    await saveGameResult(db, ['Anna', 'Bob'], ['Carol', 'Dave'], 800, 1050, 'B', NO_ROUNDS);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    const annaWon = calls[0][1][2];
    const carolWon = calls[2][1][2];

    expect(annaWon).toBe(0);  // team A lost
    expect(carolWon).toBe(1); // team B won
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
          { playerName: 'Anna', isGrand: false, won: true, team: 'A' },
          { playerName: 'Anna', isGrand: true, won: false, team: 'A' },
        ],
      },
    ];

    const db = makeMockDb();
    await saveGameResult(db, ['Anna', 'Bob'], ['Carol', 'Dave'], 1050, 800, 'A', rounds);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    const annaParams = calls[0][1]; // [displayName, normalized, won, tichuCalls, tichuWins, grandCalls, grandWins, score]

    expect(annaParams[3]).toBe(1); // tichuCalls
    expect(annaParams[4]).toBe(1); // tichuWins
    expect(annaParams[5]).toBe(1); // grandCalls
    expect(annaParams[6]).toBe(0); // grandWins
  });

  it('uses normalized (lowercase, trimmed) name as the conflict key', async () => {
    const db = makeMockDb();
    await saveGameResult(db, ['  Anna  ', 'Bob'], ['Carol', 'Dave'], 1050, 800, 'A', NO_ROUNDS);

    const calls = (db.runAsync as jest.Mock).mock.calls;
    const annaParams = calls[0][1];

    expect(annaParams[0]).toBe('  Anna  '); // display_name preserved
    expect(annaParams[1]).toBe('anna');      // normalized_name trimmed + lowercased
  });
});
