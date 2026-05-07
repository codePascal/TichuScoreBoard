import type { SQLiteDatabase } from 'expo-sqlite';
import type { CompletedRound, Player, Team } from '../../types';
import { aggregateTichuStats } from '../../domain';

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
 * Writes game result to the database.
 *
 * @param db           The player SQLite database.
 * @param teamAPlayers The player names in team A.
 * @param teamBPlayers The player names in team B.
 * @param teamAScore   The total score of team A.
 * @param teamBScore   The total score of team B.
 * @param winner       The winning team.
 * @param rounds       The completed rounds during the game with detailed information.
 */
export async function saveGameResult(
  db: SQLiteDatabase,
  teamAPlayers: [string, string],
  teamBPlayers: [string, string],
  teamAScore: number,
  teamBScore: number,
  winner: Team,
  rounds: CompletedRound[]
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const name of teamAPlayers) {
      await _upsertPlayer(db, name, winner === 'A', teamAScore, rounds);
    }
    for (const name of teamBPlayers) {
      await _upsertPlayer(db, name, winner === 'B', teamBScore, rounds);
    }
  });
}

async function _upsertPlayer(
  db: SQLiteDatabase,
  displayName: string,
  won: boolean,
  score: number,
  rounds: CompletedRound[]
): Promise<void> {
  const normalized = displayName.toLowerCase().trim();
  const stats = aggregateTichuStats(displayName, rounds);

  await db.runAsync(
    `INSERT INTO players
       (display_name, normalized_name, games_played, games_won,
        tichu_calls, tichu_wins, grand_tichu_calls, grand_tichu_wins, total_score)
     VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(normalized_name) DO UPDATE SET
       display_name      = excluded.display_name,
       games_played      = games_played + 1,
       games_won         = games_won + excluded.games_won,
       tichu_calls       = tichu_calls + excluded.tichu_calls,
       tichu_wins        = tichu_wins + excluded.tichu_wins,
       grand_tichu_calls = grand_tichu_calls + excluded.grand_tichu_calls,
       grand_tichu_wins  = grand_tichu_wins + excluded.grand_tichu_wins,
       total_score       = total_score + excluded.total_score`,
    [
      displayName,
      normalized,
      won ? 1 : 0,
      stats.tichuCalls,
      stats.tichuWins,
      stats.grandCalls,
      stats.grandWins,
      score,
    ]
  );
}

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
