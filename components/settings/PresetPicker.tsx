// ABOUTME: Modal preset picker component for selecting tempo defaults.
// ABOUTME: Shows all presets with time and description, highlights current selection.

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { TempoPreset } from '../../types/tempo'
import { getTotalTime, formatTime } from '../../constants/tempos'

export interface PresetPickerProps {
  /** Whether the picker is visible */
  visible: boolean
  /** List of presets to display */
  presets: readonly TempoPreset[]
  /** Currently selected preset ID */
  selectedPresetId: string
  /** Callback when a preset is selected */
  onSelect: (presetId: string) => void
  /** Callback when picker is closed */
  onClose: () => void
  /** Title displayed at top of picker */
  title: string
}

/**
 * Modal picker for selecting a tempo preset.
 * Shows preset label, total time, and description.
 * Highlights the currently selected preset with a checkmark.
 */
export default function PresetPicker({
  visible,
  presets,
  selectedPresetId,
  onSelect,
  onClose,
  title,
}: PresetPickerProps) {
  const handleSelect = (presetId: string) => {
    onSelect(presetId)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable testID="preset-picker-backdrop" style={styles.backdrop} onPress={onClose}>
        <View testID="preset-picker" style={styles.container} accessibilityViewIsModal={true}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                testID="preset-picker-close"
                style={styles.closeButton}
                onPress={onClose}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {presets.map((preset) => {
                const isSelected = preset.id === selectedPresetId
                const totalTime = getTotalTime(preset)
                const timeString = formatTime(totalTime)

                return (
                  <Pressable
                    key={preset.id}
                    testID={`preset-item-${preset.id}`}
                    style={[styles.presetItem, isSelected && styles.presetItemSelected]}
                    onPress={() => handleSelect(preset.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${preset.label}, ${timeString}, ${preset.description}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.presetInfo}>
                      <View style={styles.presetLabelRow}>
                        <Text style={[styles.presetLabel, isSelected && styles.textSelected]}>
                          {preset.label}
                        </Text>
                        <Text style={[styles.presetTime, isSelected && styles.textSelected]}>
                          {timeString}
                        </Text>
                      </View>
                      <Text
                        style={[styles.presetDescription, isSelected && styles.descriptionSelected]}
                      >
                        {preset.description}
                      </Text>
                    </View>

                    {isSelected && (
                      <View testID={`preset-selected-${preset.id}`}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      </View>
                    )}
                  </Pressable>
                )
              })}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  list: {
    padding: spacing.sm,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  presetItemSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  presetInfo: {
    flex: 1,
  },
  presetLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  presetLabel: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  presetTime: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  presetDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  textSelected: {
    color: colors.primary,
  },
  descriptionSelected: {
    color: colors.text,
  },
})
