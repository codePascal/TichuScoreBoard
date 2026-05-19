import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { useGameStore } from '../../store/gameStore';
import RoundEntryView from '../components/RoundEntryView';
import RoundHistorySection from '../components/RoundHistorySection';
import WinnerModal from '../components/WinnerModal';
import { saveGameResult } from '../../data';
import { colors, radius } from '../theme';

export default function GameScreen() {
  const db = useSQLiteContext();
  const {
    teamAScore, teamBScore, rounds, phase,
    teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2,
    getTeamAName, getTeamBName, getWinner, resetGame,
  } = useGameStore();

  const handleSaveAndFinish = async () => {
    try {
      await saveGameResult(
        db,
        [teamAPlayer1, teamAPlayer2],
        [teamBPlayer1, teamBPlayer2],
        teamAScore,
        teamBScore,
        getWinner(),
        rounds
      );
    } catch (e) {
      console.error('Failed to save game:', e);
    } finally {
      resetGame();
      router.replace('/(tabs)');
    }
  };

  const handleAbandon = () => {
    resetGame();
    router.replace('/(tabs)');
  };

  const confirmAbandon = () => {
    Alert.alert(
      'Abandon Game?',
      'Progress will not be saved to the leaderboard.',
      [
        { text: 'Continue Playing', style: 'cancel' },
        { text: 'Abandon', style: 'destructive', onPress: handleAbandon },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={confirmAbandon} style={styles.abandonBtn}>
          <Text style={styles.abandonText}>✕ Abandon</Text>
        </TouchableOpacity>
        <Text style={styles.roundLabel}>Round {rounds.length + 1}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.scoresRow}>
          <TeamScoreCard name={getTeamAName()} score={teamAScore} color={colors.teamA} />
          <View style={styles.vsDivider}>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.vsRounds}>{rounds.length}</Text>
            <Text style={styles.vsRoundsLabel}>rounds</Text>
          </View>
          <TeamScoreCard name={getTeamBName()} score={teamBScore} color={colors.teamB} />
        </View>

        <RoundEntryView />

        <RoundHistorySection
          rounds={rounds}
          teamAName={getTeamAName()}
          teamBName={getTeamBName()}
        />
      </ScrollView>

      {phase === 'finished' && (
        <WinnerModal onSave={handleSaveAndFinish} onAbandon={handleAbandon} />
      )}
    </SafeAreaView>
  );
}

function TeamScoreCard({ name, score, color }: { name: string; score: number; color: string }) {
  const progress = Math.min(score / 1000, 1);
  return (
    <View style={[styles.scoreCard, { borderColor: color + '44' }]}>
      <Text style={[styles.scoreCardName, { color }]} numberOfLines={2}>{name}</Text>
      <Text style={[styles.scoreCardNum, score >= 1000 && { color: colors.gold }]}>{score}</Text>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.scoreCardTarget}>/ 1000</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  abandonBtn: { width: 80 },
  abandonText: { fontSize: 14, color: colors.danger, fontWeight: '600' },
  roundLabel: { fontSize: 15, fontWeight: '700', color: colors.gold, letterSpacing: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  scoresRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    alignItems: 'center',
  },
  scoreCardName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  scoreCardNum: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  progressBg: {
    width: '100%',
    height: 5,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  scoreCardTarget: { fontSize: 11, color: colors.textMuted },
  vsDivider: { width: 40, alignItems: 'center', justifyContent: 'center', gap: 2 },
  vsText: { fontSize: 12, fontWeight: '900', color: colors.gold, letterSpacing: 1 },
  vsRounds: { fontSize: 18, fontWeight: '700', color: colors.textMuted, fontVariant: ['tabular-nums'] },
  vsRoundsLabel: { fontSize: 10, color: colors.textMuted },
});
