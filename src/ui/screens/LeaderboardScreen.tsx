import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { getAllPlayers } from '../../data';
import { playerWinRate, playerTichuRate, playerGrandTichuRate, playerAvgScore } from '../../domain';
import { colors, radius, shared } from '../theme';
import type { Player, SortKey } from '../../types';

/**
 * Creates the leaderboard screen.
 * 
 * The leaderboard displays stats such as played games, won games, etc. in descending order.
 */
export default function LeaderboardScreen() {
  const db = useSQLiteContext();
  const [players, setPlayers] = useState<Player[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('winRate');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setPlayers(await getAllPlayers(db));
    } catch (e) {
      console.error(e);
    }
  }, [db]);

  // Reload whenever this tab becomes active (e.g. right after a game is saved).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = search.trim()
    ? players.filter((p) => p.displayName.toLowerCase().includes(search.toLowerCase()))
    : players;
  const sorted = _sortPlayers(filtered, sortKey);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Leaderboard</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search player…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.chip, sortKey === opt.key && styles.chipActive]}
            onPress={() => setSortKey(opt.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, sortKey === opt.key && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
        }
      >
        {sorted.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No players yet</Text>
            <Text style={styles.emptyMsg}>
              {search
                ? 'No players match your search.'
                : 'Finish a game to populate the leaderboard.'}
            </Text>
          </View>
        ) : (
          sorted.map((player, idx) => (
            <TouchableOpacity
              key={player.id}
              style={styles.playerRow}
              onPress={() => router.push(`/player/${player.id}`)}
              activeOpacity={0.8}
            >
              <Text style={[styles.rank, idx < 3 && { fontSize: 22 }]}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
              </Text>

              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.displayName}</Text>
                <Text style={styles.playerMeta}>
                  {player.gamesPlayed}G · {player.gamesWon}W
                </Text>
              </View>

              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{_formatStat(player, sortKey)}</Text>
                <Text style={styles.statLabel}>
                  {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * The sort options for the leaderboard. Sort option consist of a key and its display name.
 */
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'winRate', label: 'Win Rate' },
  { key: 'gamesPlayed', label: 'Games' },
  { key: 'tichuRate', label: 'Tichu %' },
  { key: 'grandTichuRate', label: 'GT %' },
  { key: 'avgScore', label: 'Avg Score' },
];

/**
 * Sorts a player list by the given key in descending order.
 * Pure function - returns new array without mutating the input.
 */
function _sortPlayers(players: Player[], key: SortKey): Player[] {
  return [...players].sort((a, b) => {
    switch (key) {
      case 'winRate':
        return playerWinRate(b) - playerWinRate(a);
      case 'gamesPlayed':
        return b.gamesPlayed - a.gamesPlayed;
      case 'tichuRate':
        return playerTichuRate(b) - playerTichuRate(a);
      case 'grandTichuRate':
        return playerGrandTichuRate(b) - playerGrandTichuRate(a);
      case 'avgScore':
        return playerAvgScore(b) - playerAvgScore(a);
      default: {
        const _exhaustive: never = key;
        throw new Error(`Unhandled sort key: ${String(_exhaustive)}`);
      }
    }
  });
}

/**
 * Formats the stat value for `key` as a display string, e.g., `"67%"`
 */
function _formatStat(p: Player, key: SortKey): string {
  switch (key) {
    case 'winRate':
      return `${Math.round(playerWinRate(p))}%`;
    case 'gamesPlayed':
      return `${p.gamesPlayed}`;
    case 'tichuRate':
      return `${Math.round(playerTichuRate(p))}%`;
    case 'grandTichuRate':
      return `${Math.round(playerGrandTichuRate(p))}%`;
    case 'avgScore':
      return `${Math.round(playerAvgScore(p))}`;
    default: {
      const _exhaustive: never = key;
      throw new Error(`Unhandled sort key: ${String(_exhaustive)}`);
    }
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pageHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  chipsScroll: { flexGrow: 0 },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 10, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.gold },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.background },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 8, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textSecondary },
  emptyMsg: { fontSize: 14, color: colors.textMuted, textAlign: 'center', maxWidth: 260 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  rank: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    width: 28,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  playerInfo: { flex: 1, gap: 2 },
  playerName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  playerMeta: { fontSize: 12, color: colors.textMuted },
  statBlock: { alignItems: 'flex-end', gap: 1 },
  statValue: { fontSize: 17, fontWeight: '700', color: colors.gold, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10, color: colors.textMuted },
});
