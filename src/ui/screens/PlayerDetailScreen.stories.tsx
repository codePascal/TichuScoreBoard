import type { Meta, StoryObj } from '@storybook/react';
import PlayerDetailScreen from './PlayerDetailScreen';
import { __setPlayerById } from '../../../__mocks__/expo-sqlite';
import type { Decorator } from '@storybook/react';

const anna    = { id: 1, display_name: 'Anna',   normalized_name: 'anna',   games_played: 24, games_won: 16, tichu_calls: 18, tichu_wins: 13, grand_tichu_calls: 5, grand_tichu_wins: 3, total_score: 25200 };
const newbie  = { id: 5, display_name: 'Newbie', normalized_name: 'newbie', games_played:  0, games_won:  0, tichu_calls:  0, tichu_wins:  0, grand_tichu_calls: 0, grand_tichu_wins: 0, total_score:     0 };

const meta: Meta<typeof PlayerDetailScreen> = {
  title: 'Screens/PlayerDetailScreen',
  component: PlayerDetailScreen,
};

export default meta;
type Story = StoryObj<typeof PlayerDetailScreen>;

const withAnna: Decorator = (Story) => { __setPlayerById(anna);   return <Story />; };
const withNewbie: Decorator = (Story) => { __setPlayerById(newbie); return <Story />; };
const withNotFound: Decorator = (Story) => { __setPlayerById(null);  return <Story />; };

/** Experienced player — all stats populated. */
export const ActivePlayer: Story = {
  decorators: [withAnna],
};

/** Brand-new player — all zeros. */
export const NewPlayer: Story = {
  decorators: [withNewbie],
};

/** Player not found — error state. */
export const NotFound: Story = {
  decorators: [withNotFound],
};
