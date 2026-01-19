// ABOUTME: Jest setup file for global test configuration.
// ABOUTME: Mocks native modules that aren't available in the test environment.

// Mock expo-av module globally for navigation and other tests
// that don't have their own specific mock
jest.mock('expo-av', () => {
  const mockSound = {
    playAsync: jest.fn().mockResolvedValue(undefined),
    setPositionAsync: jest.fn().mockResolvedValue(undefined),
    setVolumeAsync: jest.fn().mockResolvedValue(undefined),
    unloadAsync: jest.fn().mockResolvedValue(undefined),
  }

  return {
    Audio: {
      Sound: {
        createAsync: jest.fn().mockResolvedValue({ sound: mockSound }),
      },
      setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    },
  }
})
