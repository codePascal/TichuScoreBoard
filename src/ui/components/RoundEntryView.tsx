import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useGameStore } from '../../store/gameStore';
import { colors, radius, shared } from '../theme';
import type { Team } from '../../types';

export default function RoundEntryView() {
  const store = useGameStore();
  const {
    teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2,
    teamAPlayer1Id, teamAPlayer2Id, teamBPlayer1Id, teamBPlayer2Id,
    sliderValue, isDoubleVictory, doubleVictoryTeam,
    setSlider, toggleDoubleVictory, setDoubleVictoryTeam, confirmRound,
    getPreviewA, getPreviewB, getRoundNumber,
  } = store;

  const cardA = Math.round(sliderValue / 5) * 5;
  const cardB = 100 - cardA;
  const prevA = getPreviewA();
  const prevB = getPreviewB();

  return (
    <View style={styles.container}>
      <Text style={[shared.sectionTitle, { textAlign: 'center' }]}>
        ROUND {getRoundNumber()}
      </Text>

      {/* 4-player tichu buttons */}
      <View style={styles.playersRow}>
        <PlayerTichuColumn label="TEAM A" color={colors.teamA}
          p1={{ id: teamAPlayer1Id!, name: teamAPlayer1 }}
          p2={{ id: teamAPlayer2Id!, name: teamAPlayer2 }}
          team='A' />
        <View style={styles.columnDivider} />
        <PlayerTichuColumn label="TEAM B" color={colors.teamB}
          p1={{ id: teamBPlayer1Id!, name: teamBPlayer1 }}
          p2={{ id: teamBPlayer2Id!, name: teamBPlayer2 }}
          team='B' />
      </View>

      <View style={styles.divider} />

      {/* Double Victory toggle */}
      <View style={[shared.row, { justifyContent: 'space-between' }]}>
        <Text style={styles.dvLabel}>👑  Double Victory</Text>
        <Switch
          value={isDoubleVictory}
          onValueChange={toggleDoubleVictory}
          trackColor={{ false: colors.surfaceHigh, true: colors.goldDim }}
          thumbColor={isDoubleVictory ? colors.gold : colors.textMuted}
        />
      </View>

      {isDoubleVictory && (
        <View style={styles.dvTeamRow}>
          {(['A', 'B'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.dvTeamBtn, doubleVictoryTeam === t && styles.dvTeamBtnActive]}
              onPress={() => setDoubleVictoryTeam(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dvTeamText, doubleVictoryTeam === t && styles.dvTeamTextActive]}>
                {t === 'A' ? `${teamAPlayer1} & ${teamAPlayer2}` : `${teamBPlayer1} & ${teamBPlayer2}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Card points slider */}
      {!isDoubleVictory && (
        <View style={styles.sliderBlock}>
          <View style={[shared.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
            <Text style={[shared.label, { color: colors.textSecondary }]}>CARD POINTS SPLIT</Text>
          </View>
          <View style={[shared.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
            <Text style={[styles.cardScore, { color: colors.teamA }]}>{cardA}</Text>
            <Text style={styles.cardSep}>—</Text>
            <Text style={[styles.cardScore, { color: colors.teamB }]}>{cardB}</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 36 }}
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={sliderValue}
            onValueChange={setSlider}
            minimumTrackTintColor={colors.teamA}
            maximumTrackTintColor={colors.teamB}
            thumbTintColor={colors.gold}
          />
          <View style={[shared.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.sliderLabel}>Team A</Text>
            <Text style={styles.sliderLabel}>Team B</Text>
          </View>
        </View>
      )}

      {/* Round score preview */}
      <View style={styles.preview}>
        <View style={styles.previewTeam}>
          <Text style={styles.previewLabel}>Team A</Text>
          <Text style={[styles.previewScore, { color: colors.teamA }]}>
            {prevA >= 0 ? `+${prevA}` : `${prevA}`}
          </Text>
        </View>
        <Text style={styles.previewArrow}>this round</Text>
        <View style={[styles.previewTeam, { alignItems: 'flex-end' }]}>
          <Text style={styles.previewLabel}>Team B</Text>
          <Text style={[styles.previewScore, { color: colors.teamB }]}>
            {prevB >= 0 ? `+${prevB}` : `${prevB}`}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmBtn} onPress={confirmRound} activeOpacity={0.85}>
        <Text style={styles.confirmText}>✓  CONFIRM ROUND</Text>
      </TouchableOpacity>
    </View>
  );
}

type PlayerSlot = { id: number; name: string };

function PlayerTichuColumn({ label, color, p1, p2, team }: {
  label: string; color: string; p1: PlayerSlot; p2: PlayerSlot; team: Team;
}) {
  return (
    <View style={styles.tiColumn}>
      <Text style={[shared.label, { color, marginBottom: 8 }]}>{label}</Text>
      <PlayerTichuRow player={p1} team={team} />
      <View style={{ height: 8 }} />
      <PlayerTichuRow player={p2} team={team} />
    </View>
  );
}

function PlayerTichuRow({ player, team }: { player: PlayerSlot; team: Team }) {
  const { getTichuEvent, setTichu } = useGameStore();
  const ev = getTichuEvent(player.id);

  type BtnDef = { id: string; label: string; isGrand: boolean; won: boolean; activeColor: string };
  const buttons: BtnDef[] = [
    { id: 'tw', label: 'T+', isGrand: false, won: true,  activeColor: colors.success },
    { id: 'tl', label: 'T–', isGrand: false, won: false, activeColor: colors.danger  },
    { id: 'gw', label: 'G+', isGrand: true,  won: true,  activeColor: colors.gold    },
    { id: 'gl', label: 'G–', isGrand: true,  won: false, activeColor: colors.danger  },
  ];

  return (
    <View>
      <Text style={styles.playerName} numberOfLines={1}>{player.name || '—'}</Text>
      <View style={shared.row}>
        {buttons.map(b => {
          const active = ev?.isGrand === b.isGrand && ev?.won === b.won;
          return (
            <TouchableOpacity
              key={b.id}
              style={[styles.tiBtn, active && { backgroundColor: b.activeColor }]}
              onPress={() => setTichu(player.id, team, b.isGrand, b.won)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tiBtnText, active && { color: colors.background }]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 14,
  },
  playersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tiColumn: {
    flex: 1,
  },
  columnDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  playerName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tiBtn: {
    width: 32,
    height: 26,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  tiBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  dvLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dvTeamRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dvTeamBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
  },
  dvTeamBtnActive: {
    backgroundColor: colors.goldDim,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  dvTeamText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  dvTeamTextActive: {
    color: colors.gold,
  },
  sliderBlock: {
    gap: 2,
  },
  cardScore: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  cardSep: {
    fontSize: 18,
    color: colors.textMuted,
  },
  sliderLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    padding: 12,
  },
  previewTeam: {
    flex: 1,
    gap: 2,
  },
  previewLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  previewScore: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  previewArrow: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    flex: 1,
  },
  confirmBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.background,
  },
});
