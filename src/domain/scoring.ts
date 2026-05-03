import type { TichuEvent, CompletedRound, Team } from '../types';

/**
 * Compute total points earned by a team in one round.
 *
 * @remarks Function is not responsible to verify validity of tichu events nor it is responsible to
 *          verify validity of total points.
 *
 * @param round The snapshot of this round.
 * @param team  Which team's score to compute.
 *
 * @returns Total points awarded or deducted for given team for this round.
 */
export function computeRoundTeamTotal(round: CompletedRound, team: Team): number {
  const cardPoints = _computeCardPoints(round, team);
  const tichuPoints = _computeTichuPoints(round.tichuEvents, team);
  return cardPoints + tichuPoints;
}

function _computeCardPoints(round: CompletedRound, team: Team): number {
  if (round.isDoubleVictory) {
    return round.doubleVictoryTeam === team ? 200 : 0;
  } else {
    return team === 'A' ? round.teamACardPoints : round.teamBCardPoints;
  }
}

function _computeTichuPoints(tichuEvents: TichuEvent[], team: Team): number {
  return tichuEvents.filter((e) => e.team === team).reduce((sum, e) => sum + _tichuPoints(e), 0);
}

function _tichuPoints(event: TichuEvent): number {
  const base = event.isGrand ? 200 : 100;
  return event.won ? base : -base;
}
