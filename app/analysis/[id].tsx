// ABOUTME: Video analysis screen showing detected swing tempo with manual adjustment.
// ABOUTME: Displays video player with frame markers, analysis results, and save functionality.

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import VideoPlayer from '../../components/video/VideoPlayer'
import AnalysisResults from '../../components/video/AnalysisResults'
import FrameAdjuster from '../../components/video/FrameAdjuster'
import TempoComparison from '../../components/video/TempoComparison'
import { videoStorage } from '../../lib/videoStorage'
import { createSwingDetector } from '../../lib/swingDetector'
import {
  compareToTargetTempo,
  findClosestPreset,
  calculateRatioFromFrames,
} from '../../lib/swingAnalysisUtils'
import { useSettingsStore } from '../../stores/settingsStore'
import { LONG_GAME_PRESETS, getPresetById } from '../../constants/tempos'
import { colors, fontSizes, spacing } from '../../constants/theme'
import { SwingVideo, SwingAnalysis } from '../../types/video'
import type { FrameMarker } from '../../components/video/VideoScrubber'

type ScreenState = 'loading' | 'not-found' | 'needs-analysis' | 'ready'

export default function AnalysisScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const defaultLongGamePresetId = useSettingsStore((s) => s.defaultLongGamePresetId)

  const [screenState, setScreenState] = useState<ScreenState>('loading')
  const [video, setVideo] = useState<SwingVideo | null>(null)
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Get the target preset from settings
  const targetPreset = useMemo(
    () => getPresetById(LONG_GAME_PRESETS, defaultLongGamePresetId) ?? LONG_GAME_PRESETS[2],
    [defaultLongGamePresetId]
  )

  // Load video on mount
  useEffect(() => {
    if (!id) {
      setScreenState('not-found')
      return
    }

    const loadVideo = async () => {
      const loadedVideo = await videoStorage.getVideo(id)

      if (!loadedVideo) {
        setScreenState('not-found')
        return
      }

      setVideo(loadedVideo)

      if (loadedVideo.analysis) {
        setAnalysis(loadedVideo.analysis)
        setScreenState('ready')
      } else {
        setScreenState('needs-analysis')
      }
    }

    loadVideo()
  }, [id])

  // Run swing detection
  const runAnalysis = useCallback(async () => {
    if (!video) return

    setIsDetecting(true)

    try {
      const detector = createSwingDetector()
      await detector.initialize()

      const result = await detector.detectSwingPhases(video.uri, video.fps)

      const backswingFrames = result.topFrame - result.takeawayFrame
      const downswingFrames = result.impactFrame - result.topFrame
      const ratio = calculateRatioFromFrames(
        result.takeawayFrame,
        result.topFrame,
        result.impactFrame
      )

      const newAnalysis: SwingAnalysis = {
        takeawayFrame: result.takeawayFrame,
        topFrame: result.topFrame,
        impactFrame: result.impactFrame,
        backswingFrames,
        downswingFrames,
        ratio,
        confidence: result.confidence,
        manuallyAdjusted: false,
      }

      setAnalysis(newAnalysis)
      setScreenState('ready')
      setHasChanges(true)

      detector.dispose()
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsDetecting(false)
    }
  }, [video])

  // Handle analysis change from FrameAdjuster
  const handleAnalysisChange = useCallback((updatedAnalysis: SwingAnalysis) => {
    setAnalysis(updatedAnalysis)
    setHasChanges(true)
  }, [])

  // Handle auto detect
  const handleAutoDetect = useCallback(() => {
    runAnalysis()
  }, [runAnalysis])

  // Save analysis
  const handleSave = useCallback(async () => {
    if (!id || !analysis) return

    await videoStorage.updateVideoAnalysis(id, analysis)
    setHasChanges(false)
    setSaveMessage('Saved!')

    // Clear message after 2 seconds
    setTimeout(() => {
      setSaveMessage(null)
    }, 2000)
  }, [id, analysis])

  // Calculate frame markers for video player
  const frameMarkers: FrameMarker[] = useMemo(() => {
    if (!analysis) return []

    return [
      { frame: analysis.takeawayFrame, color: '#4CAF50', label: 'Takeaway' },
      { frame: analysis.topFrame, color: '#FFC107', label: 'Top' },
      { frame: analysis.impactFrame, color: '#F44336', label: 'Impact' },
    ]
  }, [analysis])

  // Calculate total frames
  const totalFrames = useMemo(() => {
    if (!video) return 0
    return Math.floor((video.duration / 1000) * video.fps)
  }, [video])

  // Calculate tempo comparison
  const tempoComparison = useMemo(() => {
    if (!analysis) return null
    return compareToTargetTempo(analysis, targetPreset)
  }, [analysis, targetPreset])

  // Find closest preset
  const closestPreset = useMemo(() => {
    if (!analysis) return targetPreset
    return findClosestPreset(analysis.ratio, 'long')
  }, [analysis, targetPreset])

  // Render loading state
  if (screenState === 'loading') {
    return (
      <View testID="analysis-loading" style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  // Render not found state
  if (screenState === 'not-found') {
    return (
      <View testID="analysis-not-found" style={styles.centeredContainer}>
        <Ionicons name="alert-circle" size={64} color={colors.textSecondary} />
        <Text style={styles.notFoundTitle}>Video Not Found</Text>
        <Text style={styles.notFoundText}>
          The video you&apos;re looking for doesn&apos;t exist or has been deleted.
        </Text>
        <Pressable
          style={styles.goBackButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // Render needs analysis state
  if (screenState === 'needs-analysis' && !isDetecting) {
    return (
      <View testID="analysis-screen" style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Swing Analysis',
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />

        {/* Back button */}
        <Pressable
          testID="back-button"
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.needsAnalysisContent}>
          {video && (
            <View style={styles.videoPreview}>
              <VideoPlayer uri={video.uri} fps={video.fps} duration={video.duration} />
            </View>
          )}

          <View style={styles.analyzePrompt}>
            <Ionicons name="analytics" size={48} color={colors.primary} />
            <Text style={styles.analyzeTitle}>Analyze Your Swing</Text>
            <Text style={styles.analyzeText}>
              Detect your tempo by analyzing the swing phases automatically.
            </Text>
            <Pressable
              testID="analyze-button"
              style={styles.analyzeButton}
              onPress={runAnalysis}
              accessibilityRole="button"
              accessibilityLabel="Analyze swing"
            >
              <Text style={styles.analyzeButtonText}>Analyze Swing</Text>
            </Pressable>
          </View>
        </View>
      </View>
    )
  }

  // Render analyzing state
  if (isDetecting) {
    return (
      <View testID="analysis-screen" style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing swing...</Text>
      </View>
    )
  }

  // Render ready state with analysis
  return (
    <View testID="analysis-screen" style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Swing Analysis',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {/* Back button */}
      <Pressable
        testID="back-button"
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Swing Analysis</Text>
          {saveMessage && <Text style={styles.saveMessage}>{saveMessage}</Text>}
        </View>

        {/* Video Player */}
        {video && (
          <View style={styles.videoSection}>
            <VideoPlayer
              uri={video.uri}
              fps={video.fps}
              duration={video.duration}
              markers={frameMarkers}
              initialFrame={analysis?.takeawayFrame ?? 0}
            />
          </View>
        )}

        {/* Analysis Results */}
        {analysis && (
          <View style={styles.section}>
            <AnalysisResults
              analysis={analysis}
              fps={video?.fps ?? 30}
              targetPreset={targetPreset}
            />
          </View>
        )}

        {/* Frame Adjuster */}
        {analysis && (
          <View style={styles.section}>
            <FrameAdjuster
              analysis={analysis}
              totalFrames={totalFrames}
              onAnalysisChange={handleAnalysisChange}
              onAutoDetect={handleAutoDetect}
              isDetecting={isDetecting}
            />
          </View>
        )}

        {/* Tempo Comparison */}
        {analysis && tempoComparison && (
          <View style={styles.section}>
            <TempoComparison
              comparison={tempoComparison}
              targetPreset={targetPreset}
              closestPreset={closestPreset}
            />
          </View>
        )}

        {/* Save Button */}
        <Pressable
          testID="save-button"
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges}
          accessibilityRole="button"
          accessibilityLabel="Save analysis"
          accessibilityState={{ disabled: !hasChanges }}
        >
          <Ionicons name="checkmark" size={24} color={hasChanges ? colors.text : colors.inactive} />
          <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
            Save Changes
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xl,
    color: colors.text,
    fontWeight: 'bold',
  },
  saveMessage: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  notFoundTitle: {
    fontSize: fontSizes.xl,
    color: colors.text,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  notFoundText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  goBackButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  goBackButtonText: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  needsAnalysisContent: {
    flex: 1,
    padding: spacing.md,
  },
  videoPreview: {
    height: 300,
    marginBottom: spacing.lg,
  },
  analyzePrompt: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  analyzeTitle: {
    fontSize: fontSizes.xl,
    color: colors.text,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  analyzeText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  analyzeButtonText: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  videoSection: {
    height: 300,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButtonText: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  saveButtonTextDisabled: {
    color: colors.inactive,
  },
})
