import React from 'react';
import { Text } from 'react-native';

// Renders the icon name as text — good enough to show layout in stories.
export const Ionicons = ({
  name,
  size = 16,
  color,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}) => <Text style={[{ fontSize: size, color }, style]}>{name}</Text>;
