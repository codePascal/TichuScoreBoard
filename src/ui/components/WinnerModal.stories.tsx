import type { Meta, StoryObj } from '@storybook/react';
import WinnerModal from './WinnerModal';
import { withStoreState, FINISHED_GAME_STATE } from '../../stories/storeDecorator';

const meta: Meta<typeof WinnerModal> = {
  title: 'Components/WinnerModal',
  component: WinnerModal,
  args: {
    onSave: () => {},
    onAbandon: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof WinnerModal>;

export const TeamAWins: Story = {
  decorators: [
    withStoreState({
      ...FINISHED_GAME_STATE,
      teamAScore: 1050,
      teamBScore: 1010,
    }),
  ],
};

export const TeamBWins: Story = {
  decorators: [
    withStoreState({
      ...FINISHED_GAME_STATE,
      teamAScore: 800,
      teamBScore: 1100,
    }),
  ],
};
