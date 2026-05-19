import type { Meta, StoryObj } from '@storybook/react';
import LeaderboardScreen from './LeaderboardScreen';
import { __setRows, __resetRows } from '../../../__mocks__/expo-sqlite';
import type { Decorator } from '@storybook/react';

const meta: Meta<typeof LeaderboardScreen> = {
  title: 'Screens/LeaderboardScreen',
  component: LeaderboardScreen,
};

export default meta;
type Story = StoryObj<typeof LeaderboardScreen>;

const withPlayers: Decorator = (Story) => {
  __resetRows();
  return <Story />;
};

const withNoPlayers: Decorator = (Story) => {
  __setRows([]);
  return <Story />;
};

/** Default view — 5 players sorted by win rate. */
export const WithPlayers: Story = {
  decorators: [withPlayers],
};

/** Empty state shown before any game has been saved. */
export const NoPlayers: Story = {
  decorators: [withNoPlayers],
};
