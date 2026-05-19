import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { getPlayerById } from '../../data';
import { playerWinRate, playerTichuRate, playerGrandTichuRate, playerAvgScore } from '../../domain';
import { colors, radius, shared } from '../theme';
import type { Player } from '../../types';

/**
 * Screen showing lifetime stats and round history for a single player.
 *
 * Reads the player `id` from the route via {@link useLocalSearchParams} and
 * loads the matching record from the SQLite database on mount.
 *
 * @returns The rendered player detail screen.
 */
export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlayerById(db, Number(id))
      .then(setPlayer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, db]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>;
  }

  if (!player) {
    return <View style={styles.center}><Text style={{ color: colors.textMuted }}>Player not found.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{player.displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.playerName}>{player.displayName}</Text>
        </View>

        <View style={styles.tilesRow}>
          <Tile value={`${player.gamesPlayed}`} label="Games" />
          <Tile value={`${player.gamesWon}`} label="Wins" />
          <Tile value={`${Math.round(playerWinRate(player))}%`} label="Win Rate" />
        </View>

        <StatCard title="Tichu Calls">
          <StatRow label="Calls made"   value={`${player.tichuCalls}`} />
          <StatRow label="Calls won"    value={`${player.tichuWins}`} />
          <StatRow label="Success rate" value={`${Math.round(playerTichuRate(player))}%`} highlight />
        </StatCard>

        <StatCard title="Grand Tichu Calls">
          <StatRow label="Calls made"   value={`${player.grandTichuCalls}`} />
          <StatRow label="Calls won"    value={`${player.grandTichuWins}`} />
          <StatRow label="Success rate" value={`${Math.round(playerGrandTichuRate(player))}%`} highlight />
        </StatCard>

        <StatCard title="Scoring">
          <StatRow label="Total score"      value={`${player.totalScore}`} />
          <StatRow label="Average per game" value={`${Math.round(playerAvgScore(player))}`} highlight />
        </StatCard>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Renders a single stat value with a short label underneath. */
function Tile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

/** Renders a titled card wrapping one or more {@link StatRow} elements. */
function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.statCard}>
      <Text style={[shared.sectionTitle, { padding: 14, paddingBottom: 0 }]}>
        {title.toUpperCase()}
      </Text>
      <View style={styles.statCardDivider} />
      {children}
    </View>
  );
}

/** Renders a single labeled stat row; highlights the value in gold when `highlight` is true. */
function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: colors.gold, fontWeight: '700' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  avatarBlock: { alignItems: 'center', gap: 10, paddingTop: 8 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 40, fontWeight: '900', color: colors.gold },
  playerName: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  tilesRow: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  tileValue: { fontSize: 24, fontWeight: '900', color: colors.gold, fontVariant: ['tabular-nums'] },
  tileLabel: { fontSize: 12, color: colors.textMuted },
  statCard: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  statCardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginTop: 10 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  statLabel: { fontSize: 15, color: colors.textSecondary },
  statValue: { fontSize: 15, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
});
