import type { SQLiteDatabase } from 'expo-sqlite';
import type { CompletedRound, Player, Team } from '../../types';
import { aggregateTichuStats, normalizedName } from '../../domain';

/**
 * Fetches all players ordered alphabetically.
 *
 * @param db The player SQLite database.
 *
 * @returns All player objects, sorted alphabetically.
 */
export async function getAllPlayers(db: SQLiteDatabase): Promise<Player[]> {
  const rows = await db.getAllAsync<Record<string, number | string>>(
    'SELECT * FROM players ORDER BY display_name ASC'
  );
  return rows.map(_rowToPlayer);
}

/**
 * Fetches a single player by its unique id.
 *
 * @param db The player SQLite database.
 * @param id The player's unique ID.
 *
 * @returns The player object or null if it does not exist.
 */
export async function getPlayerById(db: SQLiteDatabase, id: number): Promise<Player | null> {
  const row = await db.getFirstAsync<Record<string, number | string>>(
    'SELECT * FROM players WHERE id = ?',
    [id]
  );
  return row ? _rowToPlayer(row) : null;
}

/**
 * Returns all players whose normalized name starts with the given normalized prefix.
 *
 * @param db     The SQLite database.
 * @param prefix The search string, matched case-insensitively from the start of the name.
 *
 * @returns Matching players sorted by games played descending (most active first).
 */
export async function searchPlayersByPrefix(
  db: SQLiteDatabase,
  prefix: string
): Promise<Player[]> {
  const normalized = normalizedName(prefix);
  if (!normalized) return [];
  const rows = await db.getAllAsync<Record<string, number | string>>(
    `SELECT * FROM players
     WHERE normalized_name LIKE ?
     ORDER BY games_played DESC
     LIMIT 5`,
    [`${normalized}%`]
  );
  return rows.map(_rowToPlayer);
}

/**
 * Returns an existing player by display name, or inserts a new one with zeroed stats.
 *
 * Matching is case-insensitive and trims whitespace. If two names normalize to the
 * same value (e.g. "Anna" and "anna") they resolve to the same player record.
 *
 * @param db          The SQLite database.
 * @param displayName The name as entered by the user.
 *
 * @returns The persisted player, with a valid database ID.
 */
export async function findOrCreatePlayer(db: SQLiteDatabase, displayName: string): Promise<Player> {
  const normalized = normalizedName(displayName);

  await db.runAsync(
    `INSERT OR IGNORE INTO players
       (display_name, normalized_name, games_played, games_won,
        tichu_calls, tichu_wins, grand_tichu_calls, grand_tichu_wins, total_score)
     VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0)`,
    [displayName, normalized]
  );

  const row = await db.getFirstAsync<Record<string, number | string>>(
    'SELECT * FROM players WHERE normalized_name = ?',
    [normalized]
  );

  // Row is guaranteed to exist: either just inserted or already present.
  return _rowToPlayer(row!);
}

/**
 * Writes the result of a finished game to each player's stats record.
 *
 * Resolves each player from the database by ID, then applies stat updates inside
 * a single transaction so either all four rows are updated or none are.
 *
 * @param db             The SQLite database.
 * @param teamAPlayerIds The database IDs of the two players on team A.
 * @param teamBPlayerIds The database IDs of the two players on team B.
 * @param teamAScore     The final score of team A.
 * @param teamBScore     The final score of team B.
 * @param winner         The winning team identifier.
 * @param rounds         The completed rounds, used to tally Tichu stats per player.
 */
export async function saveGameResult(
  db: SQLiteDatabase,
  teamAPlayerIds: [number, number],
  teamBPlayerIds: [number, number],
  teamAScore: number,
  teamBScore: number,
  winner: Team,
  rounds: CompletedRound[]
): Promise<void> {
  const [a1, a2, b1, b2] = await Promise.all([
    getPlayerById(db, teamAPlayerIds[0]),
    getPlayerById(db, teamAPlayerIds[1]),
    getPlayerById(db, teamBPlayerIds[0]),
    getPlayerById(db, teamBPlayerIds[1]),
  ]);

  if (!a1 || !a2 || !b1 || !b2) {
    throw new Error('saveGameResult: one or more player IDs could not be resolved.');
  }

  await db.withTransactionAsync(async () => {
    for (const player of [a1, a2] as const) {
      await _updatePlayerStats(db, player, winner === 'A', teamAScore, rounds);
    }
    for (const player of [b1, b2] as const) {
      await _updatePlayerStats(db, player, winner === 'B', teamBScore, rounds);
    }
  });
}

/** Updates the lifetime stats for one player after a game is saved. */
async function _updatePlayerStats(
  db: SQLiteDatabase,
  player: Player,
  won: boolean,
  score: number,
  rounds: CompletedRound[]
): Promise<void> {
  const stats = aggregateTichuStats(player.id, rounds);

  await db.runAsync(
    `UPDATE players SET
       games_played      = games_played + 1,
       games_won         = games_won + ?,
       tichu_calls       = tichu_calls + ?,
       tichu_wins        = tichu_wins + ?,
       grand_tichu_calls = grand_tichu_calls + ?,
       grand_tichu_wins  = grand_tichu_wins + ?,
       total_score       = total_score + ?
     WHERE id = ?`,
    [
      won ? 1 : 0,
      stats.tichuCalls,
      stats.tichuWins,
      stats.grandCalls,
      stats.grandWins,
      score,
      player.id,
    ]
  );
}

/** Maps a raw SQLite result row to a {@link Player} domain object. */
function _rowToPlayer(row: Record<string, number | string>): Player {
  return {
    id: row.id as number,
    displayName: row.display_name as string,
    normalizedName: row.normalized_name as string,
    gamesPlayed: row.games_played as number,
    gamesWon: row.games_won as number,
    tichuCalls: row.tichu_calls as number,
    tichuWins: row.tichu_wins as number,
    grandTichuCalls: row.grand_tichu_calls as number,
    grandTichuWins: row.grand_tichu_wins as number,
    totalScore: row.total_score as number,
  };
}
