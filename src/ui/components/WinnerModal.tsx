import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { colors, radius } from '../theme';
import { useGameStore } from '../../store/gameStore';

interface Props {
  onSave: () => void;
  onAbandon: () => void;
}

/**
 * Modal overlay shown when a game ends.
 *
 * Displays the winner's name, final scores for both teams, and two action
 * buttons: save the result to the leaderboard, or discard it.
 *
 * @param props - Component props.
 * @param props.onSave - Called when the user confirms saving to the leaderboard.
 * @param props.onAbandon - Called when the user discards the result.
 * 
 * @returns The rendered modal.
 */
export default function WinnerModal({ onSave, onAbandon }: Props) {
  const { teamAScore, teamBScore, rounds, getTeamAName, getTeamBName, getWinner } = useGameStore();
  const winner = getWinner();
  const winnerName = winner === 'A' ? getTeamAName() : getTeamBName();

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.winnerLabel}>WINNER!</Text>
          <Text style={styles.winnerName}>{winnerName}</Text>

          <View style={styles.scoresRow}>
            <ScoreBox label={getTeamAName()} score={teamAScore} color={colors.teamA} isWinner={winner === 'A'} />
            <ScoreBox label={getTeamBName()} score={teamBScore} color={colors.teamB} isWinner={winner === 'B'} />
          </View>

          <Text style={styles.roundsPlayed}>{rounds.length} rounds played</Text>

          <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>🏆  Save & Update Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.abandonBtn} onPress={onAbandon} activeOpacity={0.7}>
            <Text style={styles.abandonText}>Abandon (don't save)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/** Renders a score box with team label, final score, and a crown emoji for the winning team. */
function ScoreBox({ label, score, color, isWinner }: {
  label: string; score: number; color: string; isWinner: boolean;
}) {
  return (
    <View style={[styles.scoreBox, isWinner && styles.scoreBoxWinner]}>
      <Text style={[styles.scoreBoxLabel, { color }]} numberOfLines={2}>{label}</Text>
      <Text style={[styles.scoreBoxNum, isWinner && { color: colors.gold }]}>{score}</Text>
      {isWinner && <Text style={styles.crown}>👑</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 28,
    alignItems: 'center',
    gap: 14,
  },
  emoji: { fontSize: 56 },
  winnerLabel: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    color: colors.gold,
  },
  winnerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  scoreBox: {
    flex: 1,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  scoreBoxWinner: {
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  scoreBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreBoxNum: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  crown: { fontSize: 18 },
  roundsPlayed: {
    fontSize: 13,
    color: colors.textMuted,
  },
  saveBtn: {
    width: '100%',
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
  abandonBtn: { paddingVertical: 8 },
  abandonText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
