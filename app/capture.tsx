// ABOUTME: Full-screen camera recording screen for capturing golf swing videos.
// ABOUTME: Uses VisionCamera for high-FPS recording with overlay controls.

import React, { useState, useCallback } from 'react'
import { StyleSheet, View, Text, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import CameraPreview from '../components/video/CameraPreview'
import RecordButton from '../components/video/RecordButton'
import RecordingOverlay from '../components/video/RecordingOverlay'
import { useVideoCapture } from '../hooks/useVideoCapture'
import { videoFileManager } from '../lib/videoFileManager'
import { videoStorage } from '../lib/videoStorage'
import { colors, spacing } from '../constants/theme'

export default function CaptureScreen(): React.JSX.Element {
  const router = useRouter()
  const {
    cameraRef,
    device,
    format,
    isRecording,
    recordingDuration,
    actualFps,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
  } = useVideoCapture()

  const [isSaving, setIsSaving] = useState(false)

  const handleBack = useCallback(() => {
    if (isRecording) {
      Alert.alert('Recording in Progress', 'Are you sure you want to cancel the recording?', [
        { text: 'Continue Recording', style: 'cancel' },
        {
          text: 'Cancel Recording',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ])
    } else {
      router.back()
    }
  }, [isRecording, router])

  const handleRecordPress = useCallback(async () => {
    if (isRecording) {
      setIsSaving(true)
      try {
        const result = await stopRecording()
        if (result) {
          // Generate video ID
          const videoId = `video_${Date.now()}`

          // Save video file to permanent storage
          const savedUri = await videoFileManager.saveVideoFile(result.uri, videoId)
          if (!savedUri) {
            throw new Error('Failed to save video file')
          }

          // Generate thumbnail
          const thumbnailUri = await videoFileManager.generateThumbnail(savedUri, videoId)

          // Create video metadata and save
          await videoStorage.saveVideo({
            id: videoId,
            uri: savedUri,
            thumbnailUri,
            createdAt: Date.now(),
            duration: result.duration,
            fps: actualFps,
            width: format?.videoWidth ?? 1920,
            height: format?.videoHeight ?? 1080,
            analysis: null,
            sessionId: null,
          })

          // Navigate to analysis or back to video tab
          router.replace(`/analysis/${videoId}`)
        }
      } catch {
        Alert.alert('Error', 'Failed to save video. Please try again.')
      } finally {
        setIsSaving(false)
      }
    } else {
      startRecording()
    }
  }, [isRecording, stopRecording, startRecording, actualFps, format, router])

  // Permission not yet determined
  if (hasPermission === null) {
    return (
      <View testID="capture-screen-loading" style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.permissionText}>Checking camera permissions...</Text>
      </View>
    )
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View testID="capture-screen-no-permission" style={styles.permissionContainer}>
        <Ionicons name="videocam-off" size={64} color={colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          ProTempo needs camera access to record your swing videos for tempo analysis.
        </Text>
        <Pressable
          testID="request-permission-button"
          style={styles.permissionButton}
          onPress={requestPermission}
          accessibilityRole="button"
          accessibilityLabel="Grant camera permission"
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
        <Pressable
          style={styles.backLink}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backLinkText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // Saving state
  if (isSaving) {
    return (
      <View testID="capture-screen-saving" style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.permissionText}>Saving video...</Text>
      </View>
    )
  }

  return (
    <View testID="capture-screen" style={styles.container}>
      <CameraPreview
        cameraRef={cameraRef}
        device={device}
        format={format}
        isActive={!isSaving}
        showGrid={!isRecording}
      />

      <RecordingOverlay
        isRecording={isRecording}
        durationMs={recordingDuration}
        fps={actualFps}
        instruction="Aim camera at your swing"
      />

      {/* Back button */}
      <Pressable
        testID="capture-back-button"
        style={styles.backButton}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="close" size={28} color={colors.text} />
      </Pressable>

      {/* Record button */}
      <View style={styles.recordButtonContainer}>
        <RecordButton isRecording={isRecording} onPress={handleRecordPress} disabled={isSaving} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.xl,
  },
  permissionButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  backLinkText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl + spacing.lg,
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonContainer: {
    position: 'absolute',
    bottom: spacing.xl * 2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
})
