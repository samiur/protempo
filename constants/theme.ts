// ABOUTME: Theme constants for ProTempo app styling.
// ABOUTME: Defines colors and spacing for consistent dark mode UI.

export const colors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  error: '#CF6679',
  inactive: '#666666',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export const fontSizes = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const

export type Colors = typeof colors
export type Spacing = typeof spacing
export type FontSizes = typeof fontSizes
