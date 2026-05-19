import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { View } from 'react-native';
import RoundEntryView from './RoundEntryView';
import { withStoreState, MID_GAME_STATE } from '../../stories/storeDecorator';
import { colors } from '../theme';

const meta: Meta<typeof RoundEntryView> = {
  title: 'Components/RoundEntryView',
  component: RoundEntryView,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: colors.background }}>
        <Story />
      </View>
    ),
    withStoreState(MID_GAME_STATE),
  ],
};

export default meta;
type Story = StoryObj<typeof RoundEntryView>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verify the round number and player names render
    await expect(canvas.getByText('ROUND 3')).toBeTruthy();
    await expect(canvas.getByText('Anna')).toBeTruthy();
    // Click the first T+ button (Anna's Tichu Won)
    await userEvent.click(canvas.getAllByText('T+')[0]);
    // Preview score for Team A should now include the +100 bonus → +150
    await expect(canvas.getByText('+150')).toBeTruthy();
  },
};

export const DoubleVictory: Story = {
  decorators: [
    withStoreState({
      ...MID_GAME_STATE,
      isDoubleVictory: true,
      doubleVictoryTeam: 'A',
    }),
  ],
};

export const TeamBLeading: Story = {
  decorators: [
    withStoreState({
      ...MID_GAME_STATE,
      sliderValue: 30, // Team A 30 pts, Team B 70 pts
    }),
  ],
};

export const WithTichuPending: Story = {
  decorators: [
    withStoreState({
      ...MID_GAME_STATE,
      pendingTichuEvents: [
        { playerId: 1, isGrand: false, won: true,  team: 'A' },
        { playerId: 3, isGrand: true,  won: false, team: 'B' },
      ],
    }),
  ],
};
