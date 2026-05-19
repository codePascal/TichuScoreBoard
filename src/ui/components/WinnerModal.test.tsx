import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WinnerModal from './WinnerModal';
import { useGameStore, STORE_INITIAL_STATE } from '../../store/gameStore';
import { FINISHED_GAME_STATE } from '../../stories/storeDecorator';

beforeEach(() => useGameStore.setState({ ...STORE_INITIAL_STATE, ...FINISHED_GAME_STATE }, true));

describe('WinnerModal', () => {
  it('shows the WINNER! heading', () => {
    const { getByText } = render(<WinnerModal onSave={jest.fn()} onAbandon={jest.fn()} />);
    expect(getByText('WINNER!')).toBeTruthy();
  });

  it('displays the winning team name', () => {
    const { getAllByText } = render(<WinnerModal onSave={jest.fn()} onAbandon={jest.fn()} />);
    // Anna & Bob win 1050 vs 800 → appears as the winner label and in the score box
    expect(getAllByText('Anna & Bob').length).toBeGreaterThan(0);
  });

  it('shows both team scores', () => {
    const { getByText } = render(<WinnerModal onSave={jest.fn()} onAbandon={jest.fn()} />);
    expect(getByText('1050')).toBeTruthy();
    expect(getByText('800')).toBeTruthy();
  });

  it('shows the number of rounds played', () => {
    const { getByText } = render(<WinnerModal onSave={jest.fn()} onAbandon={jest.fn()} />);
    expect(getByText(`${FINISHED_GAME_STATE.rounds.length} rounds played`)).toBeTruthy();
  });

  it('calls onSave when the save button is pressed', () => {
    const onSave = jest.fn();
    const { getByText } = render(<WinnerModal onSave={onSave} onAbandon={jest.fn()} />);
    fireEvent.press(getByText(/Save & Update Leaderboard/));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onAbandon when the abandon link is pressed', () => {
    const onAbandon = jest.fn();
    const { getByText } = render(<WinnerModal onSave={jest.fn()} onAbandon={onAbandon} />);
    fireEvent.press(getByText(/Abandon/));
    expect(onAbandon).toHaveBeenCalledTimes(1);
  });

  it('shows a crown on the winning score box', () => {
    const { getAllByText } = render(<WinnerModal onSave={jest.fn()} onAbandon={jest.fn()} />);
    expect(getAllByText('👑').length).toBeGreaterThan(0);
  });
});
