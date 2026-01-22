// ABOUTME: Custom video scrubber with frame markers for swing analysis.
// ABOUTME: Displays a slider with colored markers indicating key swing phases.

import React from 'react'
import { StyleSheet, View } from 'react-native'
import Slider from '@react-native-community/slider'

import { colors, spacing } from '../../constants/theme'

/** Represents a marker on the scrubber timeline */
export interface FrameMarker {
  /** Frame number where the marker should appear */
  frame: number
  /** Color of the marker line */
  color: string
  /** Accessible label for the marker */
  label: string
}

/** Props for the VideoScrubber component */
export interface VideoScrubberProps {
  /** Current frame position (0-indexed) */
  currentFrame: number
  /** Total number of frames in the video */
  totalFrames: number
  /** Callback when user seeks to a frame */
  onSeek: (frame: number) => void
  /** Optional array of frame markers to display */
  markers?: FrameMarker[]
  /** Whether the scrubber is disabled */
  disabled?: boolean
}

/**
 * Video scrubber component with frame-based seeking and markers.
 * Shows a slider for video position with optional colored markers
 * indicating swing phases (takeaway, top, impact).
 */
export default function VideoScrubber({
  currentFrame,
  totalFrames,
  onSeek,
  markers = [],
  disabled = false,
}: VideoScrubberProps): React.JSX.Element {
  const maxFrame = Math.max(0, totalFrames - 1)

  const handleValueChange = (value: number): void => {
    onSeek(Math.round(value))
  }

  const getMarkerPosition = (frame: number): number => {
    if (maxFrame === 0) return 0
    return Math.min(100, Math.max(0, (frame / maxFrame) * 100))
  }

  return (
    <View testID="video-scrubber" style={styles.container}>
      {/* Marker track */}
      <View style={styles.markerTrack}>
        {markers.map((marker, index) => (
          <View
            key={`marker-${index}`}
            testID={`marker-${index}`}
            style={[
              styles.marker,
              {
                left: `${getMarkerPosition(marker.frame)}%`,
                backgroundColor: marker.color,
              },
            ]}
            accessibilityLabel={`${marker.label} at frame ${marker.frame}`}
          />
        ))}
      </View>

      {/* Slider */}
      <Slider
        testID="video-scrubber-slider"
        style={styles.slider}
        minimumValue={0}
        maximumValue={maxFrame}
        value={currentFrame}
        step={1}
        onValueChange={handleValueChange}
        disabled={disabled}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.text}
        accessibilityRole="adjustable"
        accessibilityLabel="Video scrubber"
        accessibilityValue={{
          min: 0,
          max: maxFrame,
          now: currentFrame,
          text: `Frame ${currentFrame} of ${maxFrame}`,
        }}
      />
    </View>
  )
}

const MARKER_WIDTH = 2
const MARKER_HEIGHT = 16

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  markerTrack: {
    position: 'relative',
    height: MARKER_HEIGHT,
    marginBottom: -MARKER_HEIGHT / 2,
    marginHorizontal: spacing.md, // Align with slider track
    zIndex: 1,
  },
  marker: {
    position: 'absolute',
    width: MARKER_WIDTH,
    height: MARKER_HEIGHT,
    borderRadius: 1,
    transform: [{ translateX: -MARKER_WIDTH / 2 }],
  },
  slider: {
    width: '100%',
    height: 40,
  },
})
