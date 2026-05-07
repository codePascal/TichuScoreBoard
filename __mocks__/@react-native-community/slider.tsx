import React from 'react';

interface Props {
  value?: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: object;
}

/** Web fallback — renders a plain HTML range input. */
export default function Slider({
  value = 0,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  minimumTrackTintColor: _minimumTrackTintColor = '#007AFF',
  maximumTrackTintColor: _maximumTrackTintColor = '#FFFFFF',
  thumbTintColor = '#007AFF',
  style,
}: Props) {
  return (
    <input
      type="range"
      aria-label="slider"
      min={minimumValue}
      max={maximumValue}
      step={step}
      value={value}
      onChange={(e) => onValueChange?.(Number(e.target.value))}
      style={{
        width: '100%',
        accentColor: thumbTintColor,
        ...(style as React.CSSProperties),
      }}
    />
  );
}
