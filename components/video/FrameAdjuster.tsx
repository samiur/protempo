// ABOUTME: Component for manually adjusting swing frame markers.
// ABOUTME: Provides increment/decrement controls for takeaway, top, and impact frames.

import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { SwingAnalysis } from '../../types/video'
import { calculateRatioFromFrames } from '../../lib/swingAnalysisUtils'

export interface FrameAdjusterProps {
  /** Current swing analysis to adjust */
  analysis: SwingAnalysis
  /** Total number of frames in the video */
  totalFrames: number
  /** Callback when analysis changes */
  onAnalysisChange: (analysis: SwingAnalysis) => void
  /** Callback to trigger auto-detection */
  onAutoDetect: () => void
  /** Whether detection is currently running */
  isDetecting?: boolean
}

interface FrameControlProps {
  label: string
  value: number
  onIncrement: () => void
  onDecrement: () => void
  incrementDisabled: boolean
  decrementDisabled: boolean
  testIdPrefix: string
  dotColor: string
}

function FrameControl({
  label,
  value,
  onIncrement,
  onDecrement,
  incrementDisabled,
  decrementDisabled,
  testIdPrefix,
  dotColor,
}: FrameControlProps): React.JSX.Element {
  return (
    <View testID={`adjuster-${testIdPrefix}`} style={styles.frameControl}>
      <View style={styles.frameHeader}>
        <View style={[styles.frameDot, { backgroundColor: dotColor }]} />
        <Text style={styles.frameLabel}>{label}</Text>
      </View>

      <View style={styles.frameAdjuster}>
        <Pressable
          testID={`${testIdPrefix}-decrement`}
          style={[styles.adjustButton, decrementDisabled && styles.adjustButtonDisabled]}
          onPress={onDecrement}
          disabled={decrementDisabled}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label.toLowerCase()} frame`}
          accessibilityState={{ disabled: decrementDisabled }}
        >
          <Ionicons
            name="remove"
            size={20}
            color={decrementDisabled ? colors.inactive : colors.text}
          />
        </Pressable>

        <Text style={styles.frameValue}>{value}</Text>

        <Pressable
          testID={`${testIdPrefix}-increment`}
          style={[styles.adjustButton, incrementDisabled && styles.adjustButtonDisabled]}
          onPress={onIncrement}
          disabled={incrementDisabled}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label.toLowerCase()} frame`}
          accessibilityState={{ disabled: incrementDisabled }}
        >
          <Ionicons
            name="add"
            size={20}
            color={incrementDisabled ? colors.inactive : colors.text}
          />
        </Pressable>
      </View>
    </View>
  )
}

/**
 * Allows manual adjustment of swing frame markers.
 * Provides increment/decrement controls for each phase with validation
 * to ensure frames remain in correct order.
 */
export default function FrameAdjuster({
  analysis,
  totalFrames,
  onAnalysisChange,
  onAutoDetect,
  isDetecting = false,
}: FrameAdjusterProps): React.JSX.Element {
  const updateAnalysis = (takeaway: number, top: number, impact: number): void => {
    const backswingFrames = top - takeaway
    const downswingFrames = impact - top
    const ratio = calculateRatioFromFrames(takeaway, top, impact)

    onAnalysisChange({
      ...analysis,
      takeawayFrame: takeaway,
      topFrame: top,
      impactFrame: impact,
      backswingFrames,
      downswingFrames,
      ratio,
      manuallyAdjusted: true,
    })
  }

  // Takeaway constraints: 0 <= takeaway < top
  const canDecrementTakeaway = analysis.takeawayFrame > 0
  const canIncrementTakeaway = analysis.takeawayFrame < analysis.topFrame - 1

  // Top constraints: takeaway < top < impact
  const canDecrementTop = analysis.topFrame > analysis.takeawayFrame + 1
  const canIncrementTop = analysis.topFrame < analysis.impactFrame - 1

  // Impact constraints: top < impact < totalFrames
  const canDecrementImpact = analysis.impactFrame > analysis.topFrame + 1
  const canIncrementImpact = analysis.impactFrame < totalFrames - 1

  const formatRatio = (ratio: number): string => {
    return `${ratio.toFixed(1)}:1`
  }

  return (
    <View testID="frame-adjuster" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adjust Frames</Text>

        <View testID="live-ratio" style={styles.liveRatio}>
          <Text style={styles.liveRatioLabel}>Ratio</Text>
          <Text style={styles.liveRatioValue}>{formatRatio(analysis.ratio)}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <FrameControl
          label="Takeaway"
          value={analysis.takeawayFrame}
          onIncrement={() =>
            updateAnalysis(analysis.takeawayFrame + 1, analysis.topFrame, analysis.impactFrame)
          }
          onDecrement={() =>
            updateAnalysis(analysis.takeawayFrame - 1, analysis.topFrame, analysis.impactFrame)
          }
          incrementDisabled={!canIncrementTakeaway}
          decrementDisabled={!canDecrementTakeaway}
          testIdPrefix="takeaway"
          dotColor="#4CAF50"
        />

        <FrameControl
          label="Top"
          value={analysis.topFrame}
          onIncrement={() =>
            updateAnalysis(analysis.takeawayFrame, analysis.topFrame + 1, analysis.impactFrame)
          }
          onDecrement={() =>
            updateAnalysis(analysis.takeawayFrame, analysis.topFrame - 1, analysis.impactFrame)
          }
          incrementDisabled={!canIncrementTop}
          decrementDisabled={!canDecrementTop}
          testIdPrefix="top"
          dotColor="#FFC107"
        />

        <FrameControl
          label="Impact"
          value={analysis.impactFrame}
          onIncrement={() =>
            updateAnalysis(analysis.takeawayFrame, analysis.topFrame, analysis.impactFrame + 1)
          }
          onDecrement={() =>
            updateAnalysis(analysis.takeawayFrame, analysis.topFrame, analysis.impactFrame - 1)
          }
          incrementDisabled={!canIncrementImpact}
          decrementDisabled={!canDecrementImpact}
          testIdPrefix="impact"
          dotColor="#F44336"
        />
      </View>

      <Pressable
        testID="auto-detect-button"
        style={[styles.autoDetectButton, isDetecting && styles.autoDetectButtonDisabled]}
        onPress={onAutoDetect}
        disabled={isDetecting}
        accessibilityRole="button"
        accessibilityLabel="Auto detect swing phases"
        accessibilityState={{ disabled: isDetecting }}
      >
        <Ionicons name="scan" size={20} color={isDetecting ? colors.inactive : colors.primary} />
        <Text style={[styles.autoDetectText, isDetecting && styles.autoDetectTextDisabled]}>
          {isDetecting ? 'Detecting...' : 'Auto Detect'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  liveRatio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  liveRatioLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  liveRatioValue: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frameControl: {
    alignItems: 'center',
    flex: 1,
  },
  frameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  frameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  frameLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  frameAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
  },
  adjustButton: {
    padding: spacing.sm,
    borderRadius: 6,
  },
  adjustButtonDisabled: {
    opacity: 0.5,
  },
  frameValue: {
    fontSize: fontSizes.lg,
    color: colors.text,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  autoDetectButtonDisabled: {
    borderColor: colors.inactive,
  },
  autoDetectText: {
    fontSize: fontSizes.md,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  autoDetectTextDisabled: {
    color: colors.inactive,
  },
})
