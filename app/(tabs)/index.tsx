// ABOUTME: Long Game screen for 3:1 tempo training.
// ABOUTME: Placeholder screen with audio testing controls for development.

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { createAudioManager, type AudioManager } from '../../lib/audioManager'
import type { ToneStyle } from '../../types/tempo'

export default function LongGameScreen() {
  const audioManagerRef = useRef<AudioManager | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [toneStyle, setToneStyle] = useState<ToneStyle>('beep')
  const [status, setStatus] = useState<string>('Not loaded')

  useEffect(() => {
    audioManagerRef.current = createAudioManager()
    return () => {
      audioManagerRef.current?.unloadAll()
    }
  }, [])

  const handlePreload = useCallback(async () => {
    try {
      setStatus('Loading...')
      await audioManagerRef.current?.preloadAll()
      setIsLoaded(true)
      setStatus('Audio loaded')
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }, [])

  const handlePlayTone = useCallback(async (toneNumber: 1 | 2 | 3) => {
    if (!audioManagerRef.current?.isLoaded()) {
      setStatus('Audio not loaded')
      return
    }
    try {
      setStatus(`Playing tone ${toneNumber}...`)
      await audioManagerRef.current.playTone(toneNumber)
      setStatus(`Played tone ${toneNumber}`)
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }, [])

  const handleToggleToneStyle = useCallback(async () => {
    if (!audioManagerRef.current) return
    const newStyle = toneStyle === 'beep' ? 'voice' : 'beep'
    try {
      setStatus(`Switching to ${newStyle}...`)
      await audioManagerRef.current.setToneStyle(newStyle)
      setToneStyle(newStyle)
      setStatus(`Tone style: ${newStyle}`)
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }, [toneStyle])

  const handleRapidPlay = useCallback(async () => {
    if (!audioManagerRef.current?.isLoaded()) {
      setStatus('Audio not loaded')
      return
    }
    try {
      setStatus('Playing rapid sequence...')
      await audioManagerRef.current.playTone(1)
      setTimeout(async () => {
        await audioManagerRef.current?.playTone(2)
      }, 300)
      setTimeout(async () => {
        await audioManagerRef.current?.playTone(3)
        setStatus('Rapid sequence complete')
      }, 500)
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }, [])

  const handleUnload = useCallback(async () => {
    try {
      await audioManagerRef.current?.unloadAll()
      setIsLoaded(false)
      setStatus('Audio unloaded')
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Long Game</Text>
      <Text style={styles.subtitle}>3:1 Tempo Training</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Testing</Text>

        <Pressable
          style={[styles.button, isLoaded && styles.buttonDisabled]}
          onPress={handlePreload}
          disabled={isLoaded}
        >
          <Text style={styles.buttonText}>Preload Audio</Text>
        </Pressable>

        <Pressable
          style={[styles.button, !isLoaded && styles.buttonDisabled]}
          onPress={handleToggleToneStyle}
          disabled={!isLoaded}
        >
          <Text style={styles.buttonText}>Toggle Style ({toneStyle})</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Play Tones</Text>
        <View style={styles.toneButtons}>
          <Pressable
            style={[styles.toneButton, !isLoaded && styles.buttonDisabled]}
            onPress={() => handlePlayTone(1)}
            disabled={!isLoaded}
          >
            <Text style={styles.buttonText}>1</Text>
          </Pressable>
          <Pressable
            style={[styles.toneButton, !isLoaded && styles.buttonDisabled]}
            onPress={() => handlePlayTone(2)}
            disabled={!isLoaded}
          >
            <Text style={styles.buttonText}>2</Text>
          </Pressable>
          <Pressable
            style={[styles.toneButton, !isLoaded && styles.buttonDisabled]}
            onPress={() => handlePlayTone(3)}
            disabled={!isLoaded}
          >
            <Text style={styles.buttonText}>3</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          style={[styles.button, !isLoaded && styles.buttonDisabled]}
          onPress={handleRapidPlay}
          disabled={!isLoaded}
        >
          <Text style={styles.buttonText}>Rapid Test (1-2-3)</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonDanger, !isLoaded && styles.buttonDisabled]}
          onPress={handleUnload}
          disabled={!isLoaded}
        >
          <Text style={styles.buttonText}>Unload Audio</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: '100%',
  },
  statusLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: fontSizes.md,
    color: colors.primary,
    flex: 1,
  },
  section: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.inactive,
    opacity: 0.5,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  toneButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toneButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
})
