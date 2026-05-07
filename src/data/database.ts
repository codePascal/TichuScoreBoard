import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Initializes the database at app startup via SQLiteProvider.
 *
 * @param db
 */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await _enableWal(db);
  await _createTables(db);
}

async function _enableWal(db: SQLiteDatabase): Promise<void> {
  // Enables WAL (Write-Ahead Logging) mode for better read/write concurrency.
  await db.execAsync('PRAGMA journal_mode = WAL;');
}

async function _createTables(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS players (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name       TEXT NOT NULL,
      normalized_name    TEXT NOT NULL UNIQUE,
      games_played       INTEGER NOT NULL DEFAULT 0,
      games_won          INTEGER NOT NULL DEFAULT 0,
      tichu_calls        INTEGER NOT NULL DEFAULT 0,
      tichu_wins         INTEGER NOT NULL DEFAULT 0,
      grand_tichu_calls  INTEGER NOT NULL DEFAULT 0,
      grand_tichu_wins   INTEGER NOT NULL DEFAULT 0,
      total_score        INTEGER NOT NULL DEFAULT 0
    );
  `);
}
