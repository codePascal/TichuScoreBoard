import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../store/gameStore';
import { getAllPlayers, findOrCreatePlayer, searchPlayersByPrefix } from '../../data';
import PlayerNameField from '../components/PlayerNameField';
import { colors, radius, shared } from '../theme';
import type { Player } from '../../types';

/**
 * Setup screen for configuring a new game.
 *
 * Lets users enter player names for both teams, with live autocomplete
 * suggestions drawn from the player database. Transitions to the game screen
 * once all four names are filled in and the start button is pressed.
 *
 * @returns The rendered setup screen.
 */
export default function StartScreen() {
  const db = useSQLiteContext();
  const { teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2, setSetup, startGame } =
    useGameStore();

  // Per-field suggestion lists, refreshed from the DB as the user types.
  const [suggestionsA1, setSuggestionsA1] = useState<Player[]>([]);
  const [suggestionsA2, setSuggestionsA2] = useState<Player[]>([]);
  const [suggestionsB1, setSuggestionsB1] = useState<Player[]>([]);
  const [suggestionsB2, setSuggestionsB2] = useState<Player[]>([]);

  // On focus: pre-populate all four fields with the full player list.
  useFocusEffect(
    useCallback(() => {
      getAllPlayers(db)
        .then((all) => {
          setSuggestionsA1(all);
          setSuggestionsA2(all);
          setSuggestionsB1(all);
          setSuggestionsB2(all);
        })
        .catch(console.error);
    }, [db])
  );

  // Debounced DB search per field — fires 300 ms after the user stops typing.
  useDebounced(teamAPlayer1, (v) => searchPlayersByPrefix(db, v).then(setSuggestionsA1));
  useDebounced(teamAPlayer2, (v) => searchPlayersByPrefix(db, v).then(setSuggestionsA2));
  useDebounced(teamBPlayer1, (v) => searchPlayersByPrefix(db, v).then(setSuggestionsB1));
  useDebounced(teamBPlayer2, (v) => searchPlayersByPrefix(db, v).then(setSuggestionsB2));

  const canStart = [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2].every(
    (n) => n.trim().length > 0
  );

  const handleStart = async () => {
    const [a1, a2, b1, b2] = await Promise.all([
      findOrCreatePlayer(db, teamAPlayer1),
      findOrCreatePlayer(db, teamAPlayer2),
      findOrCreatePlayer(db, teamBPlayer1),
      findOrCreatePlayer(db, teamBPlayer2),
    ]);
    startGame(a1, a2, b1, b2);
    router.push('/game');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleBlock}>
            <Text style={styles.titleMain}>TICHU</Text>
            <Text style={styles.titleSub}>SCOREBOARD</Text>
          </View>

          <TeamSection
            teamName="TEAM A"
            color={colors.teamA}
            player1={teamAPlayer1}
            player2={teamAPlayer2}
            onChange1={(v) => setSetup('teamAPlayer1', v)}
            onChange2={(v) => setSetup('teamAPlayer2', v)}
            suggestions1={suggestionsA1}
            suggestions2={suggestionsA2}
          />

          <View style={styles.vsRow}>
            <View style={styles.vsLine} />
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.vsLine} />
          </View>

          <TeamSection
            teamName="TEAM B"
            color={colors.teamB}
            player1={teamBPlayer1}
            player2={teamBPlayer2}
            onChange1={(v) => setSetup('teamBPlayer1', v)}
            onChange2={(v) => setSetup('teamBPlayer2', v)}
            suggestions1={suggestionsB1}
            suggestions2={suggestionsB2}
          />

          <TouchableOpacity
            style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={!canStart}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>START GAME</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Renders the player-entry card for one team, with two name fields and autocomplete. */
function TeamSection({
  teamName,
  color,
  player1,
  player2,
  onChange1,
  onChange2,
  suggestions1,
  suggestions2,
}: {
  teamName: string;
  color: string;
  player1: string;
  player2: string;
  onChange1: (v: string) => void;
  onChange2: (v: string) => void;
  suggestions1: Player[];
  suggestions2: Player[];
}) {
  return (
    <View style={[styles.teamCard, { borderColor: color + '55' }]}>
      <Text style={[shared.sectionTitle, { color }]}>{teamName}</Text>
      <View style={{ gap: 10 }}>
        <View style={{ zIndex: 2 }}>
          <PlayerNameField
            label="Player 1"
            value={player1}
            onChangeText={onChange1}
            allPlayers={suggestions1}
          />
        </View>
        <View style={{ zIndex: 1 }}>
          <PlayerNameField
            label="Player 2"
            value={player2}
            onChangeText={onChange2}
            allPlayers={suggestions2}
          />
        </View>
      </View>
    </View>
  );
}

/** Calls `fn` with the latest value of `value`, debounced by 300 ms. */
function useDebounced(value: string, fn: (v: string) => void) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const id = setTimeout(() => fnRef.current(value), 300);
    return () => clearTimeout(id);
  }, [value]);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  titleBlock: { alignItems: 'center', paddingTop: 20, paddingBottom: 8, gap: 4 },
  titleMain: { fontSize: 38, fontWeight: '900', color: colors.gold, letterSpacing: 2 },
  titleSub: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, letterSpacing: 6 },
  teamCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  vsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vsLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.divider },
  vsText: { fontSize: 16, fontWeight: '900', color: colors.gold, letterSpacing: 2 },
  startBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  startBtnDisabled: { backgroundColor: colors.goldDim },
  startBtnText: { fontSize: 17, fontWeight: '900', letterSpacing: 2, color: colors.background },
});
