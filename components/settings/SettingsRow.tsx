// ABOUTME: Versatile settings row component supporting toggle, value, navigation, slider, and segmented types.
// ABOUTME: Provides consistent styling and accessibility for all settings UI patterns.

import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import Slider from '@react-native-community/slider'
import { Ionicons } from '@expo/vector-icons'

import { colors, fontSizes, spacing } from '../../constants/theme'

export interface SegmentOption {
  value: string
  label: string
}

export interface SettingsRowProps {
  /** Row label displayed on the left */
  label: string
  /** Type of row determines the right-side control */
  type: 'toggle' | 'value' | 'navigation' | 'slider' | 'segmented'
  /** Current value (boolean for toggle, string/number for others) */
  value: boolean | string | number
  /** Callback for toggle change */
  onToggle?: (value: boolean) => void
  /** Callback for navigation press */
  onPress?: () => void
  /** Callback for slider change */
  onSliderChange?: (value: number) => void
  /** Callback for segment change */
  onSegmentChange?: (value: string) => void
  /** Minimum value for slider */
  sliderMin?: number
  /** Maximum value for slider */
  sliderMax?: number
  /** Step value for slider */
  sliderStep?: number
  /** Formatter function for displaying slider value */
  valueFormatter?: (value: number) => string
  /** Segment options for segmented type */
  segments?: SegmentOption[]
}

/**
 * A flexible settings row component that supports multiple interaction types:
 * - toggle: On/off switch
 * - value: Read-only value display
 * - navigation: Tappable row with chevron
 * - slider: Adjustable slider with value display
 * - segmented: Segmented control buttons
 */
export default function SettingsRow({
  label,
  type,
  value,
  onToggle,
  onPress,
  onSliderChange,
  onSegmentChange,
  sliderMin = 0,
  sliderMax = 1,
  sliderStep,
  valueFormatter,
  segments,
}: SettingsRowProps) {
  const isNavigation = type === 'navigation'

  const renderRightContent = () => {
    switch (type) {
      case 'toggle':
        return (
          <Switch
            testID="settings-toggle"
            value={value as boolean}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
            accessibilityLabel={`${label} toggle`}
          />
        )

      case 'value':
        return <Text style={styles.valueText}>{value as string}</Text>

      case 'navigation':
        return (
          <View style={styles.navigationContent}>
            <Text style={styles.valueText}>{value as string}</Text>
            <Ionicons
              testID="navigation-indicator"
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        )

      case 'slider': {
        const numValue = value as number
        const displayValue = valueFormatter ? valueFormatter(numValue) : String(numValue)
        return (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderRow}>
              <Slider
                testID="settings-slider"
                style={styles.slider}
                value={numValue}
                minimumValue={sliderMin}
                maximumValue={sliderMax}
                step={sliderStep}
                onValueChange={onSliderChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                accessibilityLabel={`${label} slider`}
              />
            </View>
            <Text style={styles.sliderValue}>{displayValue}</Text>
          </View>
        )
      }

      case 'segmented':
        return (
          <View style={styles.segmentContainer}>
            {segments?.map((segment, index) => {
              const isSelected = value === segment.value
              const isFirst = index === 0
              const isLast = index === segments.length - 1
              return (
                <Pressable
                  key={segment.value}
                  testID={`segment-${segment.value}`}
                  style={[
                    styles.segmentButton,
                    isSelected && styles.segmentButtonSelected,
                    isFirst && styles.segmentButtonFirst,
                    isLast && styles.segmentButtonLast,
                  ]}
                  onPress={() => onSegmentChange?.(segment.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={segment.label}
                >
                  <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                    {segment.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        )

      default:
        return null
    }
  }

  const content = (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {renderRightContent()}
    </View>
  )

  if (isNavigation) {
    return (
      <Pressable
        testID="settings-row-pressable"
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}, current value ${value}`}
      >
        {content}
      </Pressable>
    )
  }

  return (
    <View testID="settings-row" style={styles.container}>
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
  },
  valueText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  navigationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sliderContainer: {
    flex: 1,
    marginLeft: spacing.md,
    alignItems: 'flex-end',
  },
  sliderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: -spacing.sm,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  segmentButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  segmentButtonFirst: {
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  segmentButtonLast: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    borderRightWidth: 0,
  },
  segmentButtonSelected: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentTextSelected: {
    color: colors.text,
  },
})
