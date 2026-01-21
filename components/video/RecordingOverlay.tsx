// ABOUTME: Overlay component for video recording with timer and FPS display.
// ABOUTME: Shows recording indicator, duration timer, FPS badge, and instruction text.

import React from 'react'
import { StyleSheet, View, Text } from 'react-native'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { formatRecordingTime } from '../../lib/cameraUtils'

export interface RecordingOverlayProps {
  isRecording: boolean
  durationMs: number
  fps: number
  instruction?: string
}

export default function RecordingOverlay({
  isRecording,
  durationMs,
  fps,
  instruction,
}: RecordingOverlayProps): React.JSX.Element {
  return (
    <View testID="recording-overlay" style={styles.container} pointerEvents="none">
      {/* Top bar with recording indicator and timer */}
      <View style={styles.topBar}>
        {isRecording && (
          <View style={styles.recordingInfo}>
            <View testID="recording-indicator" style={styles.recordingDot} />
            <Text testID="recording-timer" style={styles.timerText}>
              {formatRecordingTime(durationMs)}
            </Text>
          </View>
        )}
        <Text testID="fps-badge" style={styles.fpsBadge}>
          {fps} FPS
        </Text>
      </View>

      {/* Instruction text at bottom (only when not recording) */}
      {!isRecording && instruction && (
        <View style={styles.instructionContainer}>
          <Text testID="instruction-text" style={styles.instructionText}>
            {instruction}
          </Text>
        </View>
      )}
    </View>
  )
}

const RECORDING_DOT_SIZE = 12

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xl + spacing.md, // Account for status bar
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingBottom: spacing.sm,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordingDot: {
    width: RECORDING_DOT_SIZE,
    height: RECORDING_DOT_SIZE,
    borderRadius: RECORDING_DOT_SIZE / 2,
    backgroundColor: colors.error,
  },
  timerText: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  fpsBadge: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    overflow: 'hidden',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingBottom: spacing.xl * 3, // Space for record button
    paddingHorizontal: spacing.md,
  },
  instructionText: {
    color: colors.text,
    fontSize: fontSizes.md,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
})
