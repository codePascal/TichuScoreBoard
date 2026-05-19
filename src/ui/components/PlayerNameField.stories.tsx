import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import PlayerNameField from './PlayerNameField';
import { ALL_PLAYERS } from '../../stories/fixtures';
import { colors } from '../theme';

const meta: Meta<typeof PlayerNameField> = {
  title: 'Components/PlayerNameField',
  component: PlayerNameField,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: colors.background }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Player 1',
    value: '',
    onChangeText: () => {},
    allPlayers: [],
  },
};

export default meta;
type Story = StoryObj<typeof PlayerNameField>;

export const Empty: Story = {
  args: { value: '', allPlayers: [] },
};

export const WithHistory: Story = {
  args: {
    value: '',
    allPlayers: ALL_PLAYERS,
  },
};

export const PartialInput: Story = {
  args: {
    value: 'An',
    allPlayers: ALL_PLAYERS,
  },
};

export const Filled: Story = {
  args: {
    value: 'Anna',
    allPlayers: ALL_PLAYERS,
  },
};
