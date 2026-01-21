// ABOUTME: Large circular record button for video capture.
// ABOUTME: Shows white circle when idle, red square when recording.

import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { colors } from '../../constants/theme'

export interface RecordButtonProps {
  isRecording: boolean
  onPress: () => void
  disabled?: boolean
}

export default function RecordButton({
  isRecording,
  onPress,
  disabled = false,
}: RecordButtonProps): React.JSX.Element {
  const accessibilityLabel = isRecording ? 'Stop recording' : 'Start recording'

  return (
    <Pressable
      testID="record-button"
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <View testID="record-button-inner" style={styles.innerContainer}>
        {isRecording ? (
          <View testID="record-button-stop" style={styles.stopSquare} />
        ) : (
          <View testID="record-button-idle" style={styles.idleCircle} />
        )}
      </View>
    </Pressable>
  )
}

const BUTTON_SIZE = 80
const INNER_SIZE = 64
const STOP_SIZE = 28
const BORDER_WIDTH = 4

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  innerContainer: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idleCircle: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: colors.text,
  },
  stopSquare: {
    width: STOP_SIZE,
    height: STOP_SIZE,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
})
