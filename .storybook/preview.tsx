import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Preview } from '@storybook/react';
import { colors } from '../src/ui/theme';

// Realistic iOS screen metrics so SafeAreaView renders correctly.
const MOCK_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, bottom: 34, right: 0 },
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <SafeAreaProvider initialMetrics={MOCK_METRICS}>
        <View style={{ flex: 1, minHeight: 844, backgroundColor: colors.background }}>
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'app',
      values: [{ name: 'app', value: colors.background }],
    },
    layout: 'fullscreen',
  },
};

export default preview;
