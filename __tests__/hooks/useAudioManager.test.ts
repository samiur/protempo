// ABOUTME: Tests for the useAudioManager hook.
// ABOUTME: Verifies audio playback, volume control, and tone style handling.

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio'
import { useAudioManager } from '../../hooks/useAudioManager'

// Get mock function references
const mockUseAudioPlayer = useAudioPlayer as jest.Mock
const mockUseAudioPlayerStatus = useAudioPlayerStatus as jest.Mock
const mockSetAudioModeAsync = setAudioModeAsync as jest.Mock

describe('useAudioManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should configure audio mode on mount', async () => {
      renderHook(() => useAudioManager())

      await waitFor(() => {
        expect(mockSetAudioModeAsync).toHaveBeenCalledWith({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        })
      })
    })

    it('should use beep tone style by default', () => {
      const { result } = renderHook(() => useAudioManager())

      expect(result.current.toneStyle).toBe('beep')
    })

    it('should use provided tone style', () => {
      const { result } = renderHook(() => useAudioManager({ toneStyle: 'voice' }))

      expect(result.current.toneStyle).toBe('voice')
    })

    it('should use default volume of 1', () => {
      const { result } = renderHook(() => useAudioManager())

      expect(result.current.currentVolume).toBe(1)
    })

    it('should use provided volume', () => {
      const { result } = renderHook(() => useAudioManager({ volume: 0.5 }))

      expect(result.current.currentVolume).toBe(0.5)
    })
  })

  describe('useAudioPlayer calls', () => {
    it('should create beep player when tone style is beep', () => {
      renderHook(() => useAudioManager({ toneStyle: 'beep' }))

      // Should be called with beep source and null for others
      expect(mockUseAudioPlayer).toHaveBeenCalled()
    })

    it('should create voice players when tone style is voice', () => {
      renderHook(() => useAudioManager({ toneStyle: 'voice' }))

      expect(mockUseAudioPlayer).toHaveBeenCalled()
    })
  })

  describe('isLoaded', () => {
    it('should reflect player loaded state for beep style', () => {
      mockUseAudioPlayer.mockReturnValue({ isLoaded: true })

      const { result } = renderHook(() => useAudioManager({ toneStyle: 'beep' }))

      expect(result.current.isLoaded).toBe(true)
    })

    it('should return false when player is not loaded', () => {
      mockUseAudioPlayer.mockReturnValue({ isLoaded: false })
      mockUseAudioPlayerStatus.mockReturnValue({ isLoaded: false })

      const { result } = renderHook(() => useAudioManager({ toneStyle: 'beep' }))

      expect(result.current.isLoaded).toBe(false)
    })
  })

  describe('playTone', () => {
    it('should seek to 0 and play for tone 1', async () => {
      const mockPlay = jest.fn()
      const mockSeekTo = jest.fn().mockResolvedValue(undefined)
      mockUseAudioPlayer.mockReturnValue({
        isLoaded: true,
        play: mockPlay,
        seekTo: mockSeekTo,
        volume: 1,
      })

      const { result } = renderHook(() => useAudioManager({ toneStyle: 'beep' }))

      await act(async () => {
        await result.current.playTone(1)
      })

      expect(mockSeekTo).toHaveBeenCalledWith(0)
      expect(mockPlay).toHaveBeenCalled()
    })

    it('should seek to 0 and play for tone 2', async () => {
      const mockPlay = jest.fn()
      const mockSeekTo = jest.fn().mockResolvedValue(undefined)
      mockUseAudioPlayer.mockReturnValue({
        isLoaded: true,
        play: mockPlay,
        seekTo: mockSeekTo,
        volume: 1,
      })

      const { result } = renderHook(() => useAudioManager({ toneStyle: 'beep' }))

      await act(async () => {
        await result.current.playTone(2)
      })

      expect(mockSeekTo).toHaveBeenCalledWith(0)
      expect(mockPlay).toHaveBeenCalled()
    })

    it('should seek to 0 and play for tone 3', async () => {
      const mockPlay = jest.fn()
      const mockSeekTo = jest.fn().mockResolvedValue(undefined)
      mockUseAudioPlayer.mockReturnValue({
        isLoaded: true,
        play: mockPlay,
        seekTo: mockSeekTo,
        volume: 1,
      })

      const { result } = renderHook(() => useAudioManager({ toneStyle: 'beep' }))

      await act(async () => {
        await result.current.playTone(3)
      })

      expect(mockSeekTo).toHaveBeenCalledWith(0)
      expect(mockPlay).toHaveBeenCalled()
    })

    it('should throw if audio is not loaded', async () => {
      mockUseAudioPlayer.mockReturnValue({
        isLoaded: false,
        play: jest.fn(),
        seekTo: jest.fn(),
        volume: 1,
      })

      const { result } = renderHook(() => useAudioManager({ toneStyle: 'beep' }))

      await expect(result.current.playTone(1)).rejects.toThrow('Audio not loaded')
    })
  })

  describe('setVolume', () => {
    it('should update current volume', () => {
      mockUseAudioPlayer.mockReturnValue({
        isLoaded: true,
        play: jest.fn(),
        seekTo: jest.fn(),
        volume: 1,
      })

      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.setVolume(0.5)
      })

      expect(result.current.currentVolume).toBe(0.5)
    })

    it('should clamp volume to minimum 0', () => {
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.setVolume(-0.5)
      })

      expect(result.current.currentVolume).toBe(0)
    })

    it('should clamp volume to maximum 1', () => {
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.setVolume(1.5)
      })

      expect(result.current.currentVolume).toBe(1)
    })
  })

  describe('voice tone style', () => {
    it('should use different players for each tone in voice mode', () => {
      // Voice mode should create separate players for back, down, hit
      renderHook(() => useAudioManager({ toneStyle: 'voice' }))

      // useAudioPlayer should be called 5 times: beep (null), back, down, hit, silence
      expect(mockUseAudioPlayer).toHaveBeenCalledTimes(5)
    })
  })
})
