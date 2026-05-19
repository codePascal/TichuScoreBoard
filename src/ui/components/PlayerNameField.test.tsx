import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlayerNameField from './PlayerNameField';
import { ALL_PLAYERS, ANNA } from '../../stories/fixtures';

describe('PlayerNameField', () => {
  it('renders the placeholder label', () => {
    const { getByPlaceholderText } = render(
      <PlayerNameField label="Player 1" value="" onChangeText={jest.fn()} allPlayers={[]} />
    );
    expect(getByPlaceholderText('Player 1')).toBeTruthy();
  });

  it('shows matching suggestions when focused and value is non-empty', () => {
    const { getByPlaceholderText, getByText } = render(
      <PlayerNameField label="Player 1" value="an" onChangeText={jest.fn()} allPlayers={ALL_PLAYERS} />
    );
    fireEvent(getByPlaceholderText('Player 1'), 'focus');
    expect(getByText('Anna')).toBeTruthy();
  });

  it('shows all players when focused and value is empty', () => {
    const { getByPlaceholderText, getByText } = render(
      <PlayerNameField label="Player 1" value="" onChangeText={jest.fn()} allPlayers={ALL_PLAYERS} />
    );
    fireEvent(getByPlaceholderText('Player 1'), 'focus');
    expect(getByText('Anna')).toBeTruthy();
  });

  it('does not show suggestions when not focused', () => {
    const { queryByText } = render(
      <PlayerNameField label="Player 1" value="" onChangeText={jest.fn()} allPlayers={ALL_PLAYERS} />
    );
    expect(queryByText('Anna')).toBeNull();
  });

  it('calls onChangeText with the player name when a suggestion is tapped', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <PlayerNameField label="Player 1" value="an" onChangeText={onChangeText} allPlayers={ALL_PLAYERS} />
    );
    fireEvent(getByPlaceholderText('Player 1'), 'focus');
    fireEvent.press(getByText('Anna'));
    expect(onChangeText).toHaveBeenCalledWith(ANNA.displayName);
  });

  it('hides a player whose normalizedName exactly matches the query', () => {
    // 'anna' matches normalizedName exactly → already selected → not suggested
    const { getByPlaceholderText, queryByText } = render(
      <PlayerNameField label="Player 1" value="anna" onChangeText={jest.fn()} allPlayers={ALL_PLAYERS} />
    );
    fireEvent(getByPlaceholderText('Player 1'), 'focus');
    expect(queryByText('Anna')).toBeNull();
  });

  it('shows win-rate metadata alongside each suggestion', () => {
    const { getByPlaceholderText, getByText } = render(
      <PlayerNameField label="Player 1" value="an" onChangeText={jest.fn()} allPlayers={ALL_PLAYERS} />
    );
    fireEvent(getByPlaceholderText('Player 1'), 'focus');
    // Anna: 16/24 games won → 67% WR
    expect(getByText(/67% WR/)).toBeTruthy();
  });
});
