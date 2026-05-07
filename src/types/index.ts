/**
 * Immutable snapshot of a completed round, stored in the game history.
 *
 * @param roundNumber       Round identifier.
 * @param teamACardPoints   Card points awarded to team A.
 * @param teamBCardPoints   Card points awarded to team B.
 * @param isDoubleVictory   If a team scored a double victory.
 * @param doubleVictoryTeam Which team scored the double victory.
 * @param tichuEvents       Tichu and grand Tichu calls made this round.
 */
export interface CompletedRound {
  roundNumber: number;
  teamACardPoints: number;
  teamBCardPoints: number;
  isDoubleVictory: boolean;
  doubleVictoryTeam: Team;
  tichuEvents: TichuEvent[];
}

/**
 * Persisted player record from the SQLite leaderboard.
 *
 * @param id              Unique player ID.
 * @param displayName     Display name of the player as entered by the user.
 * @param normalizedName  Lowercase and trimmed internal name for case-insensitive deduplication.
 * @param gamesPlayed     Number of games played.
 * @param gamesWon        Number of games won.
 * @param tichuCalls      Number of tichu calls.
 * @param tichuWins       Number of successful Tichu calls.
 * @param grandTichuCalls Number of grand tichu calls.
 * @param grandTichuWins  Number of successful grand Tichu calls.
 * @param totalScore      Sum of the player's team score across all saved games.
 *
 */
export interface Player {
  id: number;
  displayName: string;
  normalizedName: string;
  gamesPlayed: number;
  gamesWon: number;
  tichuCalls: number;
  tichuWins: number;
  grandTichuCalls: number;
  grandTichuWins: number;
  totalScore: number;
}

/**
 * Identifies one of the two teams.
 */
export type Team = 'A' | 'B';

/**
 * Represents a single Tichu or grand Tichu call made during a round.
 *
 * @param playerId The database ID of the player calling the Tichu.
 * @param isGrand  If the player announced a grand Tichu.
 * @param won      If the Tichu or grand Tichu was successful.
 * @param team     Which team the player belongs to.
 */
export interface TichuEvent {
  playerId: number;
  isGrand: boolean;
  won: boolean;
  team: Team;
}

/**
 * Column keys available for sorting the leaderboard.
 */
export type SortKey = 'winRate' | 'gamesPlayed' | 'tichuRate' | 'grandTichuRate' | 'avgScore';
