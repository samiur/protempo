// ABOUTME: Modal delay picker component for selecting delay between reps.
// ABOUTME: Shows delay options in seconds with current selection highlighted.

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { colors, fontSizes, spacing } from '../../constants/theme'

export interface DelayPickerProps {
  /** Whether the picker is visible */
  visible: boolean
  /** Currently selected delay in seconds */
  currentDelay: number
  /** Callback when a delay is selected */
  onSelect: (delay: number) => void
  /** Callback when picker is closed */
  onClose: () => void
}

const DELAY_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10]

/**
 * Modal picker for selecting delay between reps.
 * Shows delay options in seconds.
 * Highlights the currently selected delay with a checkmark.
 */
export default function DelayPicker({
  visible,
  currentDelay,
  onSelect,
  onClose,
}: DelayPickerProps) {
  const handleSelect = (delay: number) => {
    onSelect(delay)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable testID="delay-picker-backdrop" style={styles.backdrop} onPress={onClose}>
        <View testID="delay-picker" style={styles.container} accessibilityViewIsModal={true}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>Delay Between Reps</Text>
              <Pressable
                testID="delay-picker-close"
                style={styles.closeButton}
                onPress={onClose}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {DELAY_OPTIONS.map((delay) => {
                const isSelected = delay === currentDelay

                return (
                  <Pressable
                    key={delay}
                    testID={`delay-item-${delay}`}
                    style={[styles.item, isSelected && styles.itemSelected]}
                    onPress={() => handleSelect(delay)}
                    accessibilityRole="button"
                    accessibilityLabel={`${delay} seconds`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.itemText, isSelected && styles.textSelected]}>
                      {delay} seconds
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  itemSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  itemText: {
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  textSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
})
