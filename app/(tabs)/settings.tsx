// ABOUTME: Settings screen for user preferences.
// ABOUTME: Manages audio, defaults, display settings with tone preview and reset functionality.

import { useState, useCallback } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import Constants from 'expo-constants'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAudioManager } from '../../hooks/useAudioManager'
import {
  LONG_GAME_PRESETS,
  SHORT_GAME_PRESETS,
  getTotalTime,
  formatTime,
  getPresetById,
} from '../../constants/tempos'
import { SettingsSection, SettingsRow, PresetPicker, DelayPicker } from '../../components/settings'
import type { ToneStyle } from '../../types/tempo'

type PickerType = 'longGame' | 'shortGame' | 'delay' | null

export default function SettingsScreen() {
  const {
    toneStyle,
    volume,
    defaultLongGamePresetId,
    defaultShortGamePresetId,
    delayBetweenReps,
    keepScreenAwake,
    setToneStyle,
    setVolume,
    setDefaultLongGamePreset,
    setDefaultShortGamePreset,
    setDelayBetweenReps,
    setKeepScreenAwake,
    resetToDefaults,
  } = useSettingsStore()

  const [activePicker, setActivePicker] = useState<PickerType>(null)

  const { playTone, isLoaded } = useAudioManager({ toneStyle, volume })

  // Play preview tone when tone style changes
  const handleToneStyleChange = useCallback(
    (newStyle: string) => {
      setToneStyle(newStyle as ToneStyle)
      // Small delay to let the new audio load
      setTimeout(() => {
        if (isLoaded) {
          playTone(1).catch(() => {
            // Ignore preview errors
          })
        }
      }, 100)
    },
    [setToneStyle, playTone, isLoaded]
  )

  const handleResetPress = useCallback(() => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToDefaults()
          },
        },
      ]
    )
  }, [resetToDefaults])

  // Get display values for presets
  const longGamePreset = getPresetById(LONG_GAME_PRESETS, defaultLongGamePresetId)
  const shortGamePreset = getPresetById(SHORT_GAME_PRESETS, defaultShortGamePresetId)

  const longGameDisplayValue = longGamePreset
    ? `${longGamePreset.label} (${formatTime(getTotalTime(longGamePreset))})`
    : defaultLongGamePresetId

  const shortGameDisplayValue = shortGamePreset
    ? `${shortGamePreset.label} (${formatTime(getTotalTime(shortGamePreset))})`
    : defaultShortGamePresetId

  const appVersion = Constants.expoConfig?.version || '1.0.0'

  return (
    <View style={styles.container}>
      <ScrollView
        testID="settings-scroll-view"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        <SettingsSection title="AUDIO">
          <SettingsRow
            label="Tone Style"
            type="segmented"
            value={toneStyle}
            onSegmentChange={handleToneStyleChange}
            segments={[
              { value: 'beep', label: 'Beep' },
              { value: 'voice', label: 'Voice' },
            ]}
          />
          <SettingsRow
            label="Volume"
            type="slider"
            value={volume}
            onSliderChange={setVolume}
            sliderMin={0}
            sliderMax={1}
            sliderStep={0.05}
            valueFormatter={(v) => `${Math.round(v * 100)}%`}
          />
        </SettingsSection>

        <SettingsSection title="DEFAULTS">
          <SettingsRow
            label="Long Game Default"
            type="navigation"
            value={longGameDisplayValue}
            onPress={() => setActivePicker('longGame')}
          />
          <SettingsRow
            label="Short Game Default"
            type="navigation"
            value={shortGameDisplayValue}
            onPress={() => setActivePicker('shortGame')}
          />
          <SettingsRow
            label="Delay Between Reps"
            type="navigation"
            value={`${delayBetweenReps} seconds`}
            onPress={() => setActivePicker('delay')}
          />
        </SettingsSection>

        <SettingsSection title="DISPLAY">
          <SettingsRow
            label="Keep Screen Awake"
            type="toggle"
            value={keepScreenAwake}
            onToggle={setKeepScreenAwake}
          />
        </SettingsSection>

        <SettingsSection title="ABOUT">
          <SettingsRow label="Version" type="value" value={appVersion} />
          <SettingsRow label="App Name" type="value" value="ProTempo - Tempo Trainer" />
          <View style={styles.resetContainer}>
            <Text style={styles.resetButton} onPress={handleResetPress}>
              Reset to Defaults
            </Text>
          </View>
        </SettingsSection>
      </ScrollView>

      <PresetPicker
        visible={activePicker === 'longGame'}
        presets={LONG_GAME_PRESETS}
        selectedPresetId={defaultLongGamePresetId}
        onSelect={(id) => setDefaultLongGamePreset(id)}
        onClose={() => setActivePicker(null)}
        title="Long Game Default"
      />

      <PresetPicker
        visible={activePicker === 'shortGame'}
        presets={SHORT_GAME_PRESETS}
        selectedPresetId={defaultShortGamePresetId}
        onSelect={(id) => setDefaultShortGamePreset(id)}
        onClose={() => setActivePicker(null)}
        title="Short Game Default"
      />

      <DelayPicker
        visible={activePicker === 'delay'}
        currentDelay={delayBetweenReps}
        onSelect={setDelayBetweenReps}
        onClose={() => setActivePicker(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  screenTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  resetContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  resetButton: {
    fontSize: fontSizes.md,
    color: colors.error,
    fontWeight: '500',
  },
})
