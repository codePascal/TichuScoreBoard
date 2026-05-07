import type { CompletedRound, TichuEvent, Team } from '../types';

/**
 * Builds an immutable snapshot from the current round input state.
 *
 * @param roundNumber       The current round.
 * @param sliderValue       The value of the slider denoting card points for team A and B.
 * @param isDoubleVictory   If a team scored a double victory.
 * @param doubleVictoryTeam Which team scored the double victory.
 * @param tichuEvents       Tichu and grand Tichu calls made this round.
 *
 * @returns Immutable snapshot of current round.
 */
export function buildRound(
  roundNumber: number,
  sliderValue: number,
  isDoubleVictory: boolean,
  doubleVictoryTeam: Team,
  tichuEvents: TichuEvent[]
): CompletedRound {
  // TODO fix cards based on slider value and define how double victory is set.
  const cards = isDoubleVictory ? 0 : Math.round(sliderValue / 5) * 5;
  return {
    roundNumber,
    teamACardPoints: cards,
    teamBCardPoints: isDoubleVictory ? 0 : 100 - cards,
    isDoubleVictory,
    doubleVictoryTeam,
    tichuEvents: tichuEvents.map(e => ({ ...e })),
  };
}

/**
 * Checks if any team has reached the 1000-point win threshold.
 *
 * @remarks
 * Game is over if one or both teams have reached the win threshold. In case both teams have equal
 * points, the game advances until one team has more points.
 *
 * @param teamAScore The score of team A.
 * @param teamBScore The score of team B.
 *
 * @returns True if game is over, false otherwise.
 */
export function isGameOver(teamAScore: number, teamBScore: number): boolean {
  return (teamAScore >= 1000 || teamBScore >= 1000) && teamAScore != teamBScore;
}

/**
 * Evaluates the winning team.
 *
 * @remarks
 * It is assumed that a team has more points than the other one. Otherwise the game should not have
 * been declared over.
 *
 * @param teamAScore The score of team A.
 * @param teamBScore The score of team B.
 *
 * @returns The team with the highest score.
 */
export function winningTeam(teamAScore: number, teamBScore: number): Team {
  return teamBScore > teamAScore ? 'B' : 'A';
}

/**
 * Aggregates stats of player across all rounds of a game.
 *
 * @remarks
 * Counts number of Tichu and grand Tichu calls and successes.
 *
 * @param playerId The unique database ID of the player.
 * @param rounds   The aggregated round data of the full game.
 *
 * @returns Number of Tichu calls, wins, and grand Tichu calls and wins.
 */
export function aggregateTichuStats(
  playerId: number,
  rounds: CompletedRound[]
): { tichuCalls: number; tichuWins: number; grandCalls: number; grandWins: number } {
  let tichuCalls = 0,
    tichuWins = 0,
    grandCalls = 0,
    grandWins = 0;
  for (const round of rounds) {
    for (const ev of round.tichuEvents) {
      if (ev.playerId === playerId) {
        if (ev.isGrand) {
          grandCalls++;
          if (ev.won) grandWins++;
        } else {
          tichuCalls++;
          if (ev.won) tichuWins++;
        }
      }
    }
  }
  return { tichuCalls, tichuWins, grandCalls, grandWins };
}
