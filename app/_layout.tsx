import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '../src/data';
import { colors } from '../src/ui/theme';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="tichu-scoreboard.db" onInit={initDatabase}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="game"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="player/[id]"
          options={{
            headerShown: true,
            title: 'Player Stats',
            headerBackTitle: 'Leaderboard',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.gold,
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          }}
        />
      </Stack>
    </SQLiteProvider>
  );
}
