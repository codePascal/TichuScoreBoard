import { StyleSheet } from 'react-native';

export const colors = {
  background:    '#0e1a0e',
  surface:       '#162416',
  surfaceHigh:   '#1e2e1e',
  gold:          '#e8c14e',
  goldDim:       '#7a6228',
  teamA:         '#4a9eff',
  teamB:         '#ff5c4a',
  success:       '#3ddb6a',
  danger:        '#ff4545',
  textPrimary:   '#ffffff',
  textSecondary: 'rgba(255,255,255,0.70)',
  textMuted:     'rgba(255,255,255,0.42)',
  divider:       'rgba(255,255,255,0.10)',
} as const;

export const radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
} as const;

export const shared = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.textMuted,
    marginBottom: 12,
  },
});
