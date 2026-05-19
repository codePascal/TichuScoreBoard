import type { Meta, StoryObj } from '@storybook/react';
import StartScreen from './StartScreen';
import { useGameStore } from '../../store/gameStore';
import type { Decorator } from '@storybook/react';

const meta: Meta<typeof StartScreen> = {
  title: 'Screens/StartScreen',
  component: StartScreen,
};

export default meta;
type Story = StoryObj<typeof StartScreen>;

const withEmptySetup: Decorator = (Story) => {
  useGameStore.setState(
    {
      teamAPlayer1: '',
      teamAPlayer2: '',
      teamBPlayer1: '',
      teamBPlayer2: '',
      phase: 'setup',
    },
    true
  );
  return <Story />;
};

const withPartiallyFilled: Decorator = (Story) => {
  useGameStore.setState(
    {
      teamAPlayer1: 'Anna',
      teamAPlayer2: '',
      teamBPlayer1: 'Carol',
      teamBPlayer2: '',
      phase: 'setup',
    },
    true
  );
  return <Story />;
};

const withNamesFilledIn: Decorator = (Story) => {
  useGameStore.setState(
    {
      teamAPlayer1: 'Anna',
      teamAPlayer2: 'Bob',
      teamBPlayer1: 'Carol',
      teamBPlayer2: 'Dave',
      phase: 'setup',
    },
    true
  );
  return <Story />;
};

export const EmptySetup: Story = {
  decorators: [withEmptySetup],
};

export const PartiallyFilled: Story = {
  decorators: [withPartiallyFilled],
};

export const NamesFilledIn: Story = {
  decorators: [withNamesFilledIn],
};
