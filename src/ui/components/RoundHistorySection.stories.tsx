import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import RoundHistorySection from './RoundHistorySection';
import { withStoreState, MID_GAME_STATE } from '../../stories/storeDecorator';
import { ROUNDS_SHORT, ROUNDS_WITH_DOUBLE } from '../../stories/fixtures';
import { colors } from '../theme';

const meta: Meta<typeof RoundHistorySection> = {
  title: 'Components/RoundHistorySection',
  component: RoundHistorySection,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: colors.background }}>
        <Story />
      </View>
    ),
    withStoreState(MID_GAME_STATE),
  ],
  args: {
    teamAName: 'Anna & Bob',
    teamBName: 'Carol & Dave',
  },
};

export default meta;
type Story = StoryObj<typeof RoundHistorySection>;

export const NoRounds: Story = {
  args: { rounds: [] },
};

export const TwoRounds: Story = {
  args: { rounds: ROUNDS_SHORT },
};

export const WithDoubleVictory: Story = {
  args: { rounds: ROUNDS_WITH_DOUBLE },
};
