import React from 'react';

// ---------------------------------------------------------------------------
// Shared fake player rows.
// ---------------------------------------------------------------------------
const fakeRows = [
  {
    id: 1,
    display_name: 'Anna',
    normalized_name: 'anna',
    games_played: 24,
    games_won: 16,
    tichu_calls: 18,
    tichu_wins: 13,
    grand_tichu_calls: 5,
    grand_tichu_wins: 3,
    total_score: 25200,
  },
  {
    id: 2,
    display_name: 'Bob',
    normalized_name: 'bob',
    games_played: 20,
    games_won: 11,
    tichu_calls: 14,
    tichu_wins: 9,
    grand_tichu_calls: 3,
    grand_tichu_wins: 1,
    total_score: 19800,
  },
  {
    id: 3,
    display_name: 'Carol',
    normalized_name: 'carol',
    games_played: 18,
    games_won: 10,
    tichu_calls: 12,
    tichu_wins: 8,
    grand_tichu_calls: 4,
    grand_tichu_wins: 2,
    total_score: 17500,
  },
  {
    id: 4,
    display_name: 'Dave',
    normalized_name: 'dave',
    games_played: 15,
    games_won: 6,
    tichu_calls: 10,
    tichu_wins: 5,
    grand_tichu_calls: 2,
    grand_tichu_wins: 0,
    total_score: 13200,
  },
  {
    id: 5,
    display_name: 'Eve',
    normalized_name: 'eve',
    games_played: 8,
    games_won: 3,
    tichu_calls: 5,
    tichu_wins: 2,
    grand_tichu_calls: 1,
    grand_tichu_wins: 0,
    total_score: 7400,
  },
];

// ---------------------------------------------------------------------------
// Configurable overrides — stories can call __setRows / __setPlayerById to
// control what the mock database returns.
// ---------------------------------------------------------------------------
let _rows: typeof fakeRows = fakeRows;
let _playerById: (typeof fakeRows)[0] | null = fakeRows[0];

export const __setRows = (rows: typeof fakeRows) => {
  _rows = rows;
};
export const __resetRows = () => {
  _rows = fakeRows;
  _playerById = fakeRows[0];
};
export const __setPlayerById = (row: (typeof fakeRows)[0] | null) => {
  _playerById = row;
};

// ---------------------------------------------------------------------------
// Mock implementation of the expo-sqlite API surface used by this app.
// ---------------------------------------------------------------------------
export const useSQLiteContext = () => ({
  getAllAsync: () => Promise.resolve(_rows),
  getFirstAsync: () => Promise.resolve(_playerById),
  runAsync: () => Promise.resolve(),
  execAsync: () => Promise.resolve(),
  withTransactionAsync: async (fn: () => Promise<void>) => {
    await fn();
  },
});

export const SQLiteProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
