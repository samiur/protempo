// ABOUTME: Jest configuration for ProTempo React Native testing.
// ABOUTME: Uses jest-expo preset with TypeScript support.

module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/react-native/matchers', '<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/e2e/**',
    '!**/types/**',
    '!*.config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
