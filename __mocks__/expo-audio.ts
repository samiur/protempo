// ABOUTME: Jest mock for expo-audio module.
// ABOUTME: Provides mock implementations for audio playback hooks and functions.

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
  setAudioSamplingEnabled: jest.fn(),
  setActiveForLockScreen: jest.fn(),
  updateLockScreenMetadata: jest.fn(),
  clearLockScreenControls: jest.fn(),
  remove: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
}

export const useAudioPlayer = jest.fn((_source) => {
  return { ...mockPlayer }
})

export const useAudioPlayerStatus = jest.fn((_player) => ({
  playing: false,
  isLoaded: true,
  isBuffering: false,
  currentTime: 0,
  duration: 1,
}))

export const setAudioModeAsync = jest.fn().mockResolvedValue(undefined)
export const setIsAudioActiveAsync = jest.fn().mockResolvedValue(undefined)
export const createAudioPlayer = jest.fn((_source) => ({ ...mockPlayer }))
export const requestRecordingPermissionsAsync = jest
  .fn()
  .mockResolvedValue({ granted: true, status: 'granted' })
export const getRecordingPermissionsAsync = jest
  .fn()
  .mockResolvedValue({ granted: true, status: 'granted' })

// Reset all mocks between tests
export const __resetMocks = () => {
  useAudioPlayer.mockClear()
  useAudioPlayerStatus.mockClear()
  setAudioModeAsync.mockClear()
  setIsAudioActiveAsync.mockClear()
  createAudioPlayer.mockClear()
  mockPlayer.play.mockClear()
  mockPlayer.pause.mockClear()
  mockPlayer.seekTo.mockClear()
}

// Export mock player for test assertions
export const __mockPlayer = mockPlayer
