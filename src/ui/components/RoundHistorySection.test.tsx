import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RoundHistorySection from './RoundHistorySection';
import { useGameStore, STORE_INITIAL_STATE } from '../../store/gameStore';
import { MID_GAME_STATE } from '../../stories/storeDecorator';
import { ROUNDS_SHORT } from '../../stories/fixtures';

beforeEach(() => useGameStore.setState({ ...STORE_INITIAL_STATE, ...MID_GAME_STATE }, true));

const TEAM_A = 'Anna & Bob';
const TEAM_B = 'Carol & Dave';

describe('RoundHistorySection', () => {
  it('shows "No rounds yet" when the rounds list is empty', () => {
    const { getByText } = render(
      <RoundHistorySection rounds={[]} teamAName={TEAM_A} teamBName={TEAM_B} />
    );
    expect(getByText('No rounds yet')).toBeTruthy();
  });

  it('displays the round count in the header', () => {
    const { getByText } = render(
      <RoundHistorySection rounds={ROUNDS_SHORT} teamAName={TEAM_A} teamBName={TEAM_B} />
    );
    expect(getByText(`ROUND HISTORY (${ROUNDS_SHORT.length})`)).toBeTruthy();
  });

  it('shows the score for each round', () => {
    const { getByText } = render(
      <RoundHistorySection rounds={ROUNDS_SHORT} teamAName={TEAM_A} teamBName={TEAM_B} />
    );
    // Round 1: A=+70, B=+30 (cards only)
    expect(getByText('+70')).toBeTruthy();
    expect(getByText('+30')).toBeTruthy();
    // Round 2: A=+140 (40 cards + 100 tichu won), B=+60
    expect(getByText('+140')).toBeTruthy();
    expect(getByText('+60')).toBeTruthy();
  });

  it('collapses the list when the header is pressed', () => {
    const { getByText, queryByText } = render(
      <RoundHistorySection rounds={ROUNDS_SHORT} teamAName={TEAM_A} teamBName={TEAM_B} />
    );
    // Expanded by default → scores visible
    expect(getByText('+70')).toBeTruthy();
    // Collapse
    fireEvent.press(getByText(`ROUND HISTORY (${ROUNDS_SHORT.length})`));
    expect(queryByText('+70')).toBeNull();
  });

  it('re-expands the list when the header is pressed again', () => {
    const { getByText } = render(
      <RoundHistorySection rounds={ROUNDS_SHORT} teamAName={TEAM_A} teamBName={TEAM_B} />
    );
    fireEvent.press(getByText(`ROUND HISTORY (${ROUNDS_SHORT.length})`)); // collapse
    fireEvent.press(getByText(`ROUND HISTORY (${ROUNDS_SHORT.length})`)); // expand
    expect(getByText('+70')).toBeTruthy();
  });

  it('expands a round row to show card point detail', () => {
    const { getByText, queryByText } = render(
      <RoundHistorySection rounds={ROUNDS_SHORT} teamAName={TEAM_A} teamBName={TEAM_B} />
    );
    // Detail hidden before expanding the row
    expect(queryByText('Cards: 70 – 30')).toBeNull();
    // Press round 1's row (rounds are reversed; '1' is the round number text)
    fireEvent.press(getByText('1'));
    expect(getByText('Cards: 70 – 30')).toBeTruthy();
  });

  it('shows tichu event detail when a round row with events is expanded', () => {
    const { getByText } = render(
      <RoundHistorySection rounds={ROUNDS_SHORT} teamAName={TEAM_A} teamBName={TEAM_B} />
    );
    // Round 2 has Anna's tichu win — press '2' to expand
    fireEvent.press(getByText('2'));
    expect(getByText(/Anna.*Tichu.*✓/)).toBeTruthy();
  });
});
