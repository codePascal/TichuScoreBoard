import type { Player } from '../types';

/**
 * Win percentage of a player.
 *
 * @param p The player struct.
 *
 * @returns The win percentage in range 0 to 100 %, or 0 if the player has no recorded games.
 */
export function playerWinRate(p: Player): number {
  return p.gamesPlayed === 0 ? 0 : (p.gamesWon / p.gamesPlayed) * 100;
}

/**
 * Tichu call success rate of a player.
 *
 * @param p The player struct.
 *
 * @returns The success rate in range 0 to 100 %, or 0 if the player has no recorded games.
 */
export function playerTichuRate(p: Player): number {
  return p.tichuCalls === 0 ? 0 : (p.tichuWins / p.tichuCalls) * 100;
}

/**
 * Grand Tichu call success rate of a player.
 *
 * @param p The player struct.
 *
 * @returns The success rate in range 0 to 100 %, or 0 if the player has no recorded games.
 */
export function playerGrandTichuRate(p: Player): number {
  return p.grandTichuCalls === 0 ? 0 : (p.grandTichuWins / p.grandTichuCalls) * 100;
}

/**
 * Average team score per game.
 *
 * @param p The player struct.
 *
 * @returns The average score per game, or 0 if the player has no recorded games.
 */
export function playerAvgScore(p: Player): number {
  return p.gamesPlayed === 0 ? 0 : p.totalScore / p.gamesPlayed;
}

/**
 * Builds the normalized name of a player.
 *
 * @param displayName The display name of the player.
 *
 * @returns The normalized, lowercase, trimmed name.
 */
export function normalizedName(displayName: string): string {
  return displayName.toLowerCase().trim();
}
