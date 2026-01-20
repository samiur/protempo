// ABOUTME: E2E tests for the main app functionality.
// ABOUTME: Tests tempo playback, navigation, and settings.

import { by, device, element, expect } from 'detox'

describe('Main App', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
    // Disable synchronization to avoid timeout from background tasks
    await device.disableSynchronization()
    // Wait for app to settle
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // Skip onboarding if it appears
    try {
      await element(by.text('Skip')).tap()
    } catch {
      // Already completed onboarding
    }
  })

  afterAll(async () => {
    await device.enableSynchronization()
  })

  describe('Tab Navigation', () => {
    it('starts on Long Game screen', async () => {
      await expect(element(by.text('Long Game'))).toBeVisible()
      await expect(element(by.text('3:1 Tempo Training'))).toBeVisible()
    })

    it('can navigate to Short Game tab', async () => {
      await element(by.text('Short Game')).tap()
      await expect(element(by.text('Short Game'))).toBeVisible()
      await expect(element(by.text('2:1 Tempo Training'))).toBeVisible()
    })

    it('can navigate to Settings tab', async () => {
      await element(by.text('Settings')).tap()
      await expect(element(by.text('Settings'))).toBeVisible()
      await expect(element(by.text('AUDIO'))).toBeVisible()
    })

    it('can navigate back to Long Game', async () => {
      await element(by.text('Long Game')).tap()
      await expect(element(by.text('Long Game'))).toBeVisible()
    })
  })

  describe('Long Game Screen', () => {
    beforeAll(async () => {
      await element(by.text('Long Game')).tap()
    })

    it('shows tempo selector with presets', async () => {
      await expect(element(by.id('tempo-selector-scroll'))).toBeVisible()
      await expect(element(by.text('24/8'))).toBeVisible()
    })

    it('shows rep counter', async () => {
      await expect(element(by.id('rep-counter'))).toBeVisible()
      await expect(element(by.text('REPS'))).toBeVisible()
    })

    it('shows playback controls', async () => {
      await expect(element(by.id('playback-controls'))).toBeVisible()
    })

    it('shows session controls', async () => {
      await expect(element(by.id('session-controls'))).toBeVisible()
    })

    it('can select different tempo preset', async () => {
      await element(by.text('21/7')).tap()
      // Verify selection changed (would need accessible state or visual indicator)
    })
  })

  describe('Short Game Screen', () => {
    beforeAll(async () => {
      await element(by.text('Short Game')).tap()
    })

    it('shows 2:1 ratio presets', async () => {
      await expect(element(by.text('18/9'))).toBeVisible()
      await expect(element(by.text('16/8'))).toBeVisible()
    })
  })

  describe('Settings Screen', () => {
    beforeAll(async () => {
      await element(by.text('Settings')).tap()
    })

    it('shows audio settings section', async () => {
      await expect(element(by.text('AUDIO'))).toBeVisible()
      await expect(element(by.text('Tone Style'))).toBeVisible()
      await expect(element(by.text('Volume'))).toBeVisible()
    })

    it('shows defaults section', async () => {
      await expect(element(by.text('DEFAULTS'))).toBeVisible()
      await expect(element(by.text('Long Game Default'))).toBeVisible()
      await expect(element(by.text('Short Game Default'))).toBeVisible()
    })

    it('shows display section', async () => {
      await expect(element(by.text('DISPLAY'))).toBeVisible()
      await expect(element(by.text('Keep Screen Awake'))).toBeVisible()
    })

    it('shows about section', async () => {
      await expect(element(by.text('ABOUT'))).toBeVisible()
      await expect(element(by.text('ProTempo - Tempo Trainer'))).toBeVisible()
    })

    it('can toggle tone style', async () => {
      await element(by.id('segment-voice')).tap()
      // Tone style should now be voice
      await element(by.id('segment-beep')).tap()
      // Back to beep
    })

    it('shows reset to defaults option', async () => {
      await expect(element(by.text('Reset to Defaults'))).toBeVisible()
    })
  })
})

describe('Playback', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
    await device.disableSynchronization()
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // Skip onboarding
    try {
      await element(by.text('Skip')).tap()
    } catch {
      // Already done
    }
  })

  afterAll(async () => {
    await device.enableSynchronization()
  })

  it('can start playback', async () => {
    // Tap play button
    await element(by.id('play-button')).tap()

    // Rep counter should eventually increment
    // Note: This requires waiting for actual playback
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Check that playback started (pause button should be visible)
    await expect(element(by.id('pause-button'))).toBeVisible()
  })

  it('can stop playback', async () => {
    await element(by.id('stop-button')).tap()

    // Play button should be visible again
    await expect(element(by.id('play-button'))).toBeVisible()
  })
})
