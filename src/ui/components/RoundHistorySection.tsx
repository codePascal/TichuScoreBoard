import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, shared } from '../theme';
import type { CompletedRound } from '../../types';
import { computeRoundTeamTotal } from '../../domain';
import { useGameStore } from '../../store/gameStore';

interface Props {
  rounds: CompletedRound[];
  teamAName: string;
  teamBName: string;
}

/**
 * Collapsible list of completed rounds shown in reverse chronological order.
 *
 * Each row can be expanded to reveal card-point split, double-victory details,
 * and individual Tichu events with their point impact.
 *
 * @param props - Component props.
 * @param props.rounds - All completed rounds to display.
 * @param props.teamAName - Display name of team A (used in expanded detail rows).
 * @param props.teamBName - Display name of team B (used in expanded detail rows).
 * 
 * @returns The rendered round history section.
 */
export default function RoundHistorySection({ rounds, teamAName, teamBName }: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <Text style={shared.sectionTitle}>ROUND HISTORY ({rounds.length})</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View>
          {rounds.length === 0 ? (
            <Text style={styles.empty}>No rounds yet</Text>
          ) : (
            <>
              <View style={[shared.row, styles.tableHeader]}>
                <Text style={[styles.colNum, styles.headerText]}>#</Text>
                <Text style={[styles.colScore, styles.headerText, { color: colors.teamA }]}>A</Text>
                <Text style={[styles.colScore, styles.headerText, { color: colors.teamB }]}>B</Text>
              </View>
              {[...rounds].reverse().map(round => (
                <RoundRow key={round.roundNumber} round={round} teamAName={teamAName} teamBName={teamBName} />
              ))}
            </>
          )}
        </View>
      )}
    </View>
  );
}

/** Renders a collapsible row for one completed round; expands to show card-point and Tichu detail. */
function RoundRow({ round, teamAName, teamBName }: {
  round: CompletedRound;
  teamAName: string;
  teamBName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { getPlayerDisplayName } = useGameStore();
  const totalA = computeRoundTeamTotal(round, 'A');
  const totalB = computeRoundTeamTotal(round, 'B');

  return (
    <View>
      <TouchableOpacity style={styles.roundRow} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <Text style={styles.colNum}>{round.roundNumber}</Text>
        <Text style={[styles.colScore, { color: colors.teamA }]}>
          {totalA >= 0 ? `+${totalA}` : `${totalA}`}
        </Text>
        <Text style={[styles.colScore, { color: colors.teamB }]}>
          {totalB >= 0 ? `+${totalB}` : `${totalB}`}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.detail}>
          {round.isDoubleVictory ? (
            <Text style={styles.detailLine}>
              👑 Double Victory — {round.doubleVictoryTeam === 'A' ? teamAName : teamBName}
            </Text>
          ) : (
            <Text style={styles.detailLine}>
              Cards: {round.teamACardPoints} – {round.teamBCardPoints}
            </Text>
          )}
          {round.tichuEvents.map((ev, i) => (
            <Text
              key={i}
              style={[styles.detailLine, { color: ev.won ? colors.success : colors.danger }]}
            >
              {getPlayerDisplayName(ev.playerId)}: {ev.isGrand ? 'Grand Tichu' : 'Tichu'} {ev.won ? '✓' : '✗'}{' '}
              ({ev.won ? '+' : '-'}{ev.isGrand ? 200 : 100})
            </Text>
          ))}
        </View>
      )}

      <View style={styles.rowDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  chevron: {
    fontSize: 10,
    color: colors.textMuted,
  },
  empty: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  tableHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceHigh,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  colNum: {
    width: 28,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  colScore: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  detail: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    gap: 3,
  },
  detailLine: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
});
