// ABOUTME: Component displaying detected tempo vs target tempo comparison.
// ABOUTME: Shows visual comparison indicators, percentage difference, and recommendations.

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { TempoComparison as TempoComparisonType } from '../../types/swingDetection'
import { TempoPreset } from '../../types/tempo'
import { getTempoFeedback } from '../../lib/swingAnalysisUtils'

export interface TempoComparisonProps {
  /** Comparison result from analysis */
  comparison: TempoComparisonType
  /** Target tempo preset */
  targetPreset: TempoPreset
  /** Closest matching preset to detected tempo */
  closestPreset: TempoPreset
}

/**
 * Displays a visual comparison between detected and target tempo.
 * Shows:
 * - Detected vs target ratio
 * - Visual indicator (faster/slower/similar)
 * - Percentage difference
 * - Closest preset recommendation
 * - Feedback message
 */
export default function TempoComparison({
  comparison,
  targetPreset: _targetPreset,
  closestPreset,
}: TempoComparisonProps): React.JSX.Element {
  const formatRatio = (ratio: number): string => {
    const rounded = Math.round(ratio * 10) / 10
    return `${rounded}:1`
  }

  const getComparisonColor = (): string => {
    switch (comparison.comparison) {
      case 'similar':
        return colors.primary
      case 'faster':
        return '#FFC107'
      case 'slower':
        return '#F44336'
    }
  }

  const getComparisonIcon = (): 'checkmark-circle' | 'arrow-up' | 'arrow-down' => {
    switch (comparison.comparison) {
      case 'similar':
        return 'checkmark-circle'
      case 'faster':
        return 'arrow-up'
      case 'slower':
        return 'arrow-down'
    }
  }

  const getPercentageText = (): string => {
    const absPercent = Math.abs(Math.round(comparison.percentDifference))

    if (comparison.comparison === 'similar') {
      return 'Matches target!'
    }

    return `${absPercent}% ${comparison.comparison}`
  }

  const feedback = getTempoFeedback(comparison)

  return (
    <View
      testID="tempo-comparison"
      style={styles.container}
      accessibilityLabel="Tempo comparison result"
      accessibilityRole="text"
    >
      {/* Comparison Visual */}
      <View style={styles.comparisonSection}>
        <View style={styles.ratioCard}>
          <Text style={styles.ratioCardLabel}>Your Tempo</Text>
          <Text style={styles.ratioCardValue}>{formatRatio(comparison.detectedRatio)}</Text>
        </View>

        <View
          testID={`comparison-indicator-${comparison.comparison}`}
          style={[styles.indicator, { backgroundColor: getComparisonColor() }]}
        >
          <Ionicons name={getComparisonIcon()} size={24} color={colors.background} />
        </View>

        <View style={styles.ratioCard}>
          <Text style={styles.ratioCardLabel}>Target</Text>
          <Text style={styles.ratioCardValue}>{Math.round(comparison.targetRatio)}:1</Text>
        </View>
      </View>

      {/* Percentage Difference */}
      <View style={styles.percentageSection}>
        <Text style={[styles.percentageText, { color: getComparisonColor() }]}>
          {getPercentageText()}
        </Text>
      </View>

      {/* Feedback Message */}
      <View testID="feedback-message" style={styles.feedbackSection}>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </View>

      {/* Recommended Preset */}
      <View style={styles.recommendationSection}>
        <Text style={styles.recommendationLabel}>Recommended Preset</Text>
        <View style={styles.recommendationCard}>
          <Text style={styles.presetLabel}>{closestPreset.label}</Text>
          <Text style={styles.presetDescription}>{closestPreset.description}</Text>
        </View>
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
  comparisonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratioCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
  },
  ratioCardLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  ratioCardValue: {
    fontSize: fontSizes.xl,
    color: colors.text,
    fontWeight: 'bold',
  },
  indicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  percentageSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  percentageText: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  feedbackSection: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  feedbackText: {
    fontSize: fontSizes.md,
    color: colors.text,
    textAlign: 'center',
  },
  recommendationSection: {
    marginTop: spacing.sm,
  },
  recommendationLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recommendationCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  presetLabel: {
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  presetDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
})
