// ABOUTME: Global mock for expo-av module in tests.
// ABOUTME: Provides mock implementations for Audio.Sound and Audio.setAudioModeAsync.

const mockSound = {
  playAsync: jest.fn().mockResolvedValue(undefined),
  setPositionAsync: jest.fn().mockResolvedValue(undefined),
  setVolumeAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
}

export const Audio = {
  Sound: {
    createAsync: jest.fn().mockResolvedValue({ sound: mockSound }),
  },
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}
