import type { Meta, StoryObj } from '@storybook/react';
import GameScreen from './GameScreen';
import {
  withStoreState,
  MID_GAME_STATE,
  NEAR_FINISH_STATE,
  FINISHED_GAME_STATE,
} from '../../stories/storeDecorator';

const meta: Meta<typeof GameScreen> = {
  title: 'Screens/GameScreen',
  component: GameScreen,
};

export default meta;
type Story = StoryObj<typeof GameScreen>;

export const MidGame: Story = {
  decorators: [withStoreState(MID_GAME_STATE)],
};

export const NearFinish: Story = {
  decorators: [withStoreState(NEAR_FINISH_STATE)],
};

export const GameFinished: Story = {
  decorators: [withStoreState(FINISHED_GAME_STATE)],
};

export const EarlyGame: Story = {
  decorators: [
    withStoreState({
      ...MID_GAME_STATE,
      teamAScore: 60,
      teamBScore: 40,
      rounds: MID_GAME_STATE.rounds.slice(0, 1),
    }),
  ],
};

export const FirstRound: Story = {
  decorators: [
    withStoreState({
      ...MID_GAME_STATE,
      teamAScore: 0,
      teamBScore: 0,
      rounds: [],
    }),
  ],
};
