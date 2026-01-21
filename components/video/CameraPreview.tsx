// ABOUTME: Camera preview component wrapping react-native-vision-camera.
// ABOUTME: Handles camera display with optional grid overlay for composition.

import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Camera, CameraDevice, CameraProps } from 'react-native-vision-camera'

import { colors, fontSizes, spacing } from '../../constants/theme'

export interface CameraPreviewProps {
  cameraRef: React.RefObject<Camera | null>
  device: CameraDevice | undefined
  format: CameraProps['format']
  isActive: boolean
  showGrid?: boolean
}

export default function CameraPreview({
  cameraRef,
  device,
  format,
  isActive,
  showGrid = false,
}: CameraPreviewProps): React.JSX.Element {
  if (!device) {
    return (
      <View testID="camera-preview" style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Camera not available</Text>
      </View>
    )
  }

  return (
    <View testID="camera-preview" style={styles.container}>
      <Camera
        ref={cameraRef}
        testID="camera-view"
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={isActive}
        video={true}
        audio={true}
      />
      {showGrid && <GridOverlay />}
    </View>
  )
}

function GridOverlay(): React.JSX.Element {
  return (
    <View testID="camera-grid-overlay" style={styles.gridOverlay} pointerEvents="none">
      {/* Vertical lines at 1/3 and 2/3 */}
      <View style={[styles.gridLine, styles.verticalLine, styles.oneThirdLeft]} />
      <View style={[styles.gridLine, styles.verticalLine, styles.twoThirdsLeft]} />
      {/* Horizontal lines at 1/3 and 2/3 */}
      <View style={[styles.gridLine, styles.horizontalLine, styles.oneThirdTop]} />
      <View style={[styles.gridLine, styles.horizontalLine, styles.twoThirdsTop]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    width: '100%',
    height: 1,
  },
  oneThirdLeft: {
    left: '33.33%',
  },
  twoThirdsLeft: {
    left: '66.66%',
  },
  oneThirdTop: {
    top: '33.33%',
  },
  twoThirdsTop: {
    top: '66.66%',
  },
})
