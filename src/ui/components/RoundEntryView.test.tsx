import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RoundEntryView from './RoundEntryView';
import { useGameStore, STORE_INITIAL_STATE } from '../../store/gameStore';
import { MID_GAME_STATE } from '../../stories/storeDecorator';
import { ANNA } from '../../stories/fixtures';

beforeEach(() => useGameStore.setState({ ...STORE_INITIAL_STATE, ...MID_GAME_STATE }, true));

describe('RoundEntryView', () => {
  it('shows the current round number', () => {
    const { getByText } = render(<RoundEntryView />);
    // MID_GAME_STATE has 2 completed rounds → next is round 3
    expect(getByText('ROUND 3')).toBeTruthy();
  });

  it('shows all four player names', () => {
    const { getByText } = render(<RoundEntryView />);
    expect(getByText('Anna')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Carol')).toBeTruthy();
    expect(getByText('Dave')).toBeTruthy();
  });

  it('shows the card points split preview', () => {
    const { getByText } = render(<RoundEntryView />);
    // default sliderValue = 50 → 50 / 50
    expect(getByText('CARD POINTS SPLIT')).toBeTruthy();
  });

  it('pressing T+ for a player registers a won Tichu call', () => {
    const { getAllByText } = render(<RoundEntryView />);
    fireEvent.press(getAllByText('T+')[0]); // first T+ = Anna (teamA player 1)
    expect(useGameStore.getState().getTichuEvent(ANNA.id)).toMatchObject({
      isGrand: false,
      won: true,
      team: 'A',
    });
  });

  it('pressing T+ twice on the same player clears the call', () => {
    const { getAllByText } = render(<RoundEntryView />);
    fireEvent.press(getAllByText('T+')[0]);
    fireEvent.press(getAllByText('T+')[0]); // same button → toggle off
    expect(useGameStore.getState().getTichuEvent(ANNA.id)).toBeUndefined();
  });

  it('confirming a round increments the completed round count', () => {
    const { getByText } = render(<RoundEntryView />);
    const before = useGameStore.getState().rounds.length;
    fireEvent.press(getByText(/CONFIRM ROUND/));
    expect(useGameStore.getState().rounds).toHaveLength(before + 1);
  });

  it('enabling Double Victory hides the card points slider', () => {
    const { getByRole, queryByText } = render(<RoundEntryView />);
    fireEvent(getByRole('switch'), 'valueChange', true);
    expect(queryByText('CARD POINTS SPLIT')).toBeNull();
  });

  it('enabling Double Victory shows team selection buttons', () => {
    const { getByRole, getByText } = render(<RoundEntryView />);
    fireEvent(getByRole('switch'), 'valueChange', true);
    expect(getByText('Anna & Bob')).toBeTruthy();
    expect(getByText('Carol & Dave')).toBeTruthy();
  });
});
