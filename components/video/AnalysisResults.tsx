// ABOUTME: Component displaying detected swing analysis results.
// ABOUTME: Shows frame positions, timing calculations, ratio, and confidence.

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { SwingAnalysis } from '../../types/video'
import { TempoPreset } from '../../types/tempo'

export interface AnalysisResultsProps {
  /** The detected swing analysis */
  analysis: SwingAnalysis
  /** Frames per second of the video */
  fps: number
  /** Target tempo preset for comparison */
  targetPreset: TempoPreset
}

/**
 * Displays the detected swing analysis results including:
 * - Frame positions for takeaway, top, and impact
 * - Backswing and downswing timing in frames and seconds
 * - Calculated ratio
 * - Confidence score
 * - Comparison to target preset
 */
export default function AnalysisResults({
  analysis,
  fps,
  targetPreset,
}: AnalysisResultsProps): React.JSX.Element {
  const formatSeconds = (frames: number): string => {
    const seconds = frames / fps
    return `${seconds.toFixed(2)}s`
  }

  const formatRatio = (ratio: number): string => {
    return `${ratio.toFixed(1)}:1`
  }

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`
  }

  const targetRatio = targetPreset.backswingFrames / targetPreset.downswingFrames

  return (
    <View testID="analysis-results" style={styles.container}>
      {/* Frame Positions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Swing Phases</Text>

        <View style={styles.row}>
          <View style={styles.phaseItem}>
            <View style={[styles.phaseDot, styles.takeawayDot]} />
            <Text style={styles.phaseLabel}>Takeaway</Text>
            <Text style={styles.phaseValue}>Frame {analysis.takeawayFrame}</Text>
          </View>

          <View style={styles.phaseItem}>
            <View style={[styles.phaseDot, styles.topDot]} />
            <Text style={styles.phaseLabel}>Top</Text>
            <Text style={styles.phaseValue}>Frame {analysis.topFrame}</Text>
          </View>

          <View style={styles.phaseItem}>
            <View style={[styles.phaseDot, styles.impactDot]} />
            <Text style={styles.phaseLabel}>Impact</Text>
            <Text style={styles.phaseValue}>Frame {analysis.impactFrame}</Text>
          </View>
        </View>
      </View>

      {/* Timing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timing</Text>

        <View style={styles.timingRow}>
          <View style={styles.timingItem}>
            <Text style={styles.timingLabel}>Backswing</Text>
            <Text style={styles.timingValue}>{analysis.backswingFrames} frames</Text>
            <Text style={styles.timingSeconds}>{formatSeconds(analysis.backswingFrames)}</Text>
          </View>

          <View style={styles.timingDivider} />

          <View style={styles.timingItem}>
            <Text style={styles.timingLabel}>Downswing</Text>
            <Text style={styles.timingValue}>{analysis.downswingFrames} frames</Text>
            <Text style={styles.timingSeconds}>{formatSeconds(analysis.downswingFrames)}</Text>
          </View>
        </View>
      </View>

      {/* Ratio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tempo Ratio</Text>

        <View
          style={styles.ratioContainer}
          accessibilityLabel={`Detected ratio ${formatRatio(analysis.ratio)}`}
          accessibilityRole="text"
        >
          <Text style={styles.ratioLabel}>Ratio</Text>
          <Text style={styles.ratioValue}>{formatRatio(analysis.ratio)}</Text>
        </View>
      </View>

      {/* Target Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target</Text>

        <View style={styles.targetRow}>
          <Text style={styles.targetLabel}>{targetPreset.label}</Text>
          <Text style={styles.targetRatio}>{Math.round(targetRatio)}:1</Text>
        </View>
      </View>

      {/* Confidence Section */}
      <View style={styles.section}>
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={styles.confidenceValue}>{formatConfidence(analysis.confidence)}</Text>
        </View>

        {analysis.manuallyAdjusted && (
          <Text style={styles.manuallyAdjusted}>Manually adjusted</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseItem: {
    alignItems: 'center',
    flex: 1,
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  takeawayDot: {
    backgroundColor: '#4CAF50',
  },
  topDot: {
    backgroundColor: '#FFC107',
  },
  impactDot: {
    backgroundColor: '#F44336',
  },
  phaseLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  phaseValue: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timingItem: {
    alignItems: 'center',
    flex: 1,
  },
  timingDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  timingLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timingValue: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  timingSeconds: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ratioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
  },
  ratioLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  ratioValue: {
    fontSize: fontSizes.xl,
    color: colors.primary,
    fontWeight: 'bold',
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
  },
  targetLabel: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  targetRatio: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  confidenceValue: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  manuallyAdjusted: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
})
