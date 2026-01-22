// ABOUTME: Video player component with frame-by-frame scrubbing for swing analysis.
// ABOUTME: Composes VideoView, VideoScrubber, and FrameControls for comprehensive playback control.

import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { VideoView } from 'expo-video'
import { Ionicons } from '@expo/vector-icons'

import { colors } from '../../constants/theme'
import { useVideoPlayback } from '../../hooks/useVideoPlayback'
import VideoScrubber, { FrameMarker } from './VideoScrubber'
import FrameControls from './FrameControls'

/** Props for the VideoPlayer component */
export interface VideoPlayerProps {
  /** URI of the video file */
  uri: string
  /** Frames per second of the video */
  fps: number
  /** Duration of the video in milliseconds */
  duration: number
  /** Optional callback when the current frame changes */
  onFrameChange?: (frame: number) => void
  /** Optional array of frame markers to display on the scrubber */
  markers?: FrameMarker[]
  /** Optional initial frame to start playback from */
  initialFrame?: number
}

/**
 * Video player with frame-by-frame navigation for golf swing analysis.
 * Features:
 * - Video playback with play/pause control
 * - Frame-by-frame navigation (previous/next buttons)
 * - Scrubber with frame markers showing swing phases
 * - Playback speed control (0.25x, 0.5x, 1x)
 */
export default function VideoPlayer({
  uri,
  fps,
  duration,
  onFrameChange,
  markers = [],
  initialFrame = 0,
}: VideoPlayerProps): React.JSX.Element {
  const {
    player,
    isPlaying,
    currentFrame,
    totalFrames,
    playbackSpeed,
    togglePlayPause,
    nextFrame,
    previousFrame,
    seekToFrame,
    setPlaybackSpeed,
  } = useVideoPlayback({
    uri,
    fps,
    duration,
    initialFrame,
    onFrameChange,
  })

  const playPauseLabel = isPlaying ? 'Pause video' : 'Play video'

  return (
    <View testID="video-player" style={styles.container}>
      {/* Video view */}
      <View style={styles.videoContainer}>
        <VideoView
          testID="video-player-view"
          style={styles.video}
          player={player}
          nativeControls={false}
          contentFit="contain"
        />

        {/* Play/pause overlay button */}
        <Pressable
          testID="video-player-play-pause"
          style={styles.playPauseButton}
          onPress={togglePlayPause}
          accessibilityRole="button"
          accessibilityLabel={playPauseLabel}
        >
          <View style={styles.playPauseIconContainer}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={48} color={colors.text} />
          </View>
        </Pressable>
      </View>

      {/* Scrubber with frame markers */}
      <VideoScrubber
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        onSeek={seekToFrame}
        markers={markers}
      />

      {/* Frame navigation controls */}
      <FrameControls
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        playbackSpeed={playbackSpeed}
        onPreviousFrame={previousFrame}
        onNextFrame={nextFrame}
        onSpeedChange={setPlaybackSpeed}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playPauseButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

// Re-export FrameMarker type for convenience
export type { FrameMarker }
