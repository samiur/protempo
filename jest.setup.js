// ABOUTME: Jest setup file for global test configuration.
// ABOUTME: Mocks native modules that aren't available in the test environment.

// Mock expo-av module globally (deprecated, but kept for backward compatibility)
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

// Mock expo-audio module globally
jest.mock('expo-audio', () => {
  const mockPlayer = {
    id: 1,
    playing: false,
    muted: false,
    loop: false,
    paused: false,
    isLoaded: true,
    isAudioSamplingSupported: false,
    isBuffering: false,
    currentTime: 0,
    duration: 1,
    volume: 1,
    playbackRate: 1,
    shouldCorrectPitch: false,
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    seekTo: jest.fn().mockResolvedValue(undefined),
    setPlaybackRate: jest.fn(),
    remove: jest.fn(),
  }

  return {
    useAudioPlayer: jest.fn(() => ({ ...mockPlayer })),
    useAudioPlayerStatus: jest.fn(() => ({
      playing: false,
      isLoaded: true,
      isBuffering: false,
      currentTime: 0,
      duration: 1,
    })),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    setIsAudioActiveAsync: jest.fn().mockResolvedValue(undefined),
    createAudioPlayer: jest.fn(() => ({ ...mockPlayer })),
  }
})
