import path from 'path';
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    // Resolve React Native imports to their web equivalents.
    config.resolve!.alias = {
      ...config.resolve!.alias,
      'react-native$': require.resolve('react-native-web'),
      // Mock native-only modules that cannot run in a browser.
      'expo-sqlite': path.resolve(__dirname, '../__mocks__/expo-sqlite.ts'),
      'expo-router': path.resolve(__dirname, '../__mocks__/expo-router.tsx'),
      'expo-haptics': path.resolve(__dirname, '../__mocks__/expo-haptics.ts'),
      '@react-native-community/slider': path.resolve(
        __dirname,
        '../__mocks__/@react-native-community/slider.tsx'
      ),
      '@expo/vector-icons': path.resolve(__dirname, '../__mocks__/@expo/vector-icons.tsx'),
    };

    // Prefer .web.* extensions so cross-platform packages pick the web variant.
    config.resolve!.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.js',
      '.tsx',
      '.ts',
      '.js',
      ...(config.resolve!.extensions ?? []),
    ];

    // Use babel-preset-expo to transform TypeScript + JSX + Expo features.
    config.module!.rules!.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: { presets: ['babel-preset-expo'] },
      },
    });

    return config;
  },
};

export default config;
