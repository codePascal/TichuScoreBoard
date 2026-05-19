import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, radius } from '../theme';
import type { Player } from '../../types';
import { playerWinRate } from '../../domain';

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  allPlayers: Player[];
}

/**
 * Text input with live autocomplete suggestions drawn from a player list.
 *
 * Suggestions appear while the field is focused and are filtered by the current
 * value as a prefix. Tapping a suggestion fills the input and dismisses the
 * dropdown. Each suggestion shows the player's name and win-rate metadata.
 *
 * @param props - Component props.
 * @param props.label - Placeholder text shown when the field is empty.
 * @param props.value - Controlled text value.
 * @param props.onChangeText - Called on every keystroke with the new value.
 * @param props.allPlayers - Pool of players to derive autocomplete suggestions from.
 * 
 * @returns The rendered input with optional suggestion dropdown.
 */
export default function PlayerNameField({ label, value, onChangeText, allPlayers }: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Show up to 5 suggestions matching the given prefix when focused.
  const suggestions = focused
    ? allPlayers
        .filter(p => {
          const q = value.toLowerCase().trim();
          if (q.length === 0) return true;
          return p.normalizedName.startsWith(q) && p.normalizedName !== q;
        })
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
        .slice(0, 5)
    : [];

  return (
    <View style={styles.wrapper}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        autoCorrect={false}
        autoCapitalize="words"
      />
      {focused && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.suggestionRow, i < suggestions.length - 1 && styles.suggestionBorder]}
              onPress={() => {
                onChangeText(p.displayName);
                setFocused(false);
                inputRef.current?.blur();
              }}
            >
              <Text style={styles.suggestionName}>{p.displayName}</Text>
              <Text style={styles.suggestionMeta}>
                {p.gamesPlayed}G · {Math.round(playerWinRate(p))}% WR
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    zIndex: 999,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  suggestionName: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  suggestionMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
