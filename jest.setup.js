// ABOUTME: Jest setup file for global test configuration.
// ABOUTME: Mocks native modules that aren't available in the test environment.

// Mock AsyncStorage globally
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

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

// Mock @react-native-community/slider
jest.mock('@react-native-community/slider', () => {
  const React = require('react')
  const { View } = require('react-native')

  return {
    __esModule: true,
    default: (props) => {
      return React.createElement(View, {
        testID: props.testID,
        accessibilityRole: props.accessibilityRole || 'adjustable',
        accessibilityLabel: props.accessibilityLabel,
        accessibilityValue: props.accessibilityValue,
        minimumValue: props.minimumValue,
        maximumValue: props.maximumValue,
        step: props.step,
        value: props.value,
        disabled: props.disabled,
        onValueChange: props.onValueChange,
      })
    },
  }
})

// Mock expo-keep-awake module globally
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn().mockResolvedValue(undefined),
  deactivateKeepAwake: jest.fn(),
  useKeepAwake: jest.fn(),
}))

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

// Also update the __mocks__/expo-audio mock if tests import it directly

// Mock expo-file-system module globally (SDK 54+ class-based API)
jest.mock('expo-file-system', () => {
  // Mock File class
  class MockFile {
    constructor(...uris) {
      // Join URIs to create the file path
      this._uri = uris
        .map((u) => {
          if (u && typeof u === 'object' && u.uri) return u.uri
          return String(u)
        })
        .join('/')
        .replace(/\/+/g, '/')
      this._exists = false
    }

    get uri() {
      return this._uri
    }

    get exists() {
      return this._exists
    }

    copy(destination) {
      // Mock copy operation
    }

    delete() {
      this._exists = false
    }
  }

  // Mock Directory class
  class MockDirectory {
    constructor(...uris) {
      this._uri = uris
        .map((u) => {
          if (u && typeof u === 'object' && u.uri) return u.uri
          return String(u)
        })
        .join('/')
        .replace(/\/+/g, '/')
      this._exists = false
    }

    get uri() {
      return this._uri
    }

    get exists() {
      return this._exists
    }

    create() {
      this._exists = true
    }

    delete() {
      this._exists = false
    }

    list() {
      return []
    }
  }

  // Mock Paths static class
  const Paths = {
    document: { uri: 'file:///mock/documents/' },
    cache: { uri: 'file:///mock/cache/' },
    bundle: { uri: 'file:///mock/bundle/' },
  }

  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths,
  }
})

// Mock expo-video-thumbnails module globally
jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn().mockResolvedValue({
    uri: 'file:///mock/thumbnail.jpg',
    width: 320,
    height: 180,
  }),
}))

// Mock expo-video module globally
jest.mock('expo-video', () => {
  const React = require('react')
  const { View } = require('react-native')

  // Mock VideoPlayer class
  class MockVideoPlayer {
    constructor() {
      this._currentTime = 0
      this._duration = 10
      this._playing = false
      this._playbackRate = 1
      this._muted = false
      this._volume = 1
      this._loop = false
      this._status = 'readyToPlay'
      this._listeners = new Map()
    }

    get currentTime() {
      return this._currentTime
    }

    set currentTime(value) {
      this._currentTime = value
      this._emit('timeUpdate', { currentTime: value })
    }

    get duration() {
      return this._duration
    }

    get playing() {
      return this._playing
    }

    get playbackRate() {
      return this._playbackRate
    }

    set playbackRate(value) {
      this._playbackRate = value
      this._emit('playbackRateChange', { playbackRate: value })
    }

    get muted() {
      return this._muted
    }

    set muted(value) {
      this._muted = value
      this._emit('mutedChange', { muted: value })
    }

    get volume() {
      return this._volume
    }

    set volume(value) {
      this._volume = value
    }

    get loop() {
      return this._loop
    }

    set loop(value) {
      this._loop = value
    }

    get status() {
      return this._status
    }

    play() {
      this._playing = true
      this._emit('playingChange', { isPlaying: true })
    }

    pause() {
      this._playing = false
      this._emit('playingChange', { isPlaying: false })
    }

    replay() {
      this._currentTime = 0
      this._playing = true
      this._emit('timeUpdate', { currentTime: 0 })
      this._emit('playingChange', { isPlaying: true })
    }

    seekBy(seconds) {
      this._currentTime = Math.max(0, Math.min(this._duration, this._currentTime + seconds))
      this._emit('timeUpdate', { currentTime: this._currentTime })
    }

    release() {
      this._listeners.clear()
    }

    addListener(event, callback) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, new Set())
      }
      this._listeners.get(event).add(callback)
      return {
        remove: () => {
          this._listeners.get(event)?.delete(callback)
        },
      }
    }

    _emit(event, data) {
      const listeners = this._listeners.get(event)
      if (listeners) {
        listeners.forEach((callback) => callback(data))
      }
    }

    // Test helpers
    _setDuration(duration) {
      this._duration = duration
    }

    _setStatus(status) {
      this._status = status
      this._emit('statusChange', { status })
    }
  }

  // Mock useVideoPlayer hook
  const useVideoPlayer = jest.fn((_source) => {
    const [player] = React.useState(() => new MockVideoPlayer())
    return player
  })

  // Mock VideoView component
  const VideoView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      enterFullscreen: jest.fn(),
      exitFullscreen: jest.fn(),
    }))

    return React.createElement(View, {
      testID: props.testID || 'video-view',
      ...props,
    })
  })

  // Mock useEvent hook for subscribing to player events
  const useEvent = jest.fn((player, event, initialValue) => {
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
      if (!player) return

      const subscription = player.addListener(event, (data) => {
        setValue(data)
      })

      return () => subscription.remove()
    }, [player, event])

    return value
  })

  // Mock useEventListener hook
  const useEventListener = jest.fn((player, event, callback) => {
    React.useEffect(() => {
      if (!player) return

      const subscription = player.addListener(event, callback)

      return () => subscription.remove()
    }, [player, event, callback])
  })

  return {
    VideoView,
    useVideoPlayer,
    useEvent,
    useEventListener,
    // Export MockVideoPlayer for test assertions
    __MockVideoPlayer: MockVideoPlayer,
  }
})

// Mock react-native-vision-camera module globally
jest.mock('react-native-vision-camera', () => {
  const React = require('react')

  // Store callbacks for testing
  let recordingCallbacks = {
    onRecordingFinished: null,
    onRecordingError: null,
  }

  // Mock Camera component
  const MockCamera = React.forwardRef((props, ref) => {
    const { View } = require('react-native')

    // Expose recording methods via ref
    React.useImperativeHandle(ref, () => ({
      startRecording: jest.fn(({ onRecordingFinished, onRecordingError }) => {
        recordingCallbacks.onRecordingFinished = onRecordingFinished
        recordingCallbacks.onRecordingError = onRecordingError
      }),
      stopRecording: jest.fn(() => {
        // When stopRecording is called, trigger the onRecordingFinished callback
        if (recordingCallbacks.onRecordingFinished) {
          setTimeout(() => {
            recordingCallbacks.onRecordingFinished({
              path: 'file:///mock/video.mp4',
              duration: 5000,
            })
          }, 0)
        }
      }),
    }))

    return React.createElement(View, {
      testID: props.testID || 'camera-view',
      ...props,
    })
  })

  return {
    Camera: MockCamera,
    useCameraDevice: jest.fn(() => ({
      id: 'back-camera',
      position: 'back',
      name: 'Back Camera',
      hasFlash: true,
      hasTorch: true,
      formats: [],
    })),
    useCameraFormat: jest.fn(() => ({
      maxFps: 240,
      videoWidth: 1920,
      videoHeight: 1080,
    })),
    useCameraPermission: jest.fn(() => ({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    })),
    useMicrophonePermission: jest.fn(() => ({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    })),
  }
})
