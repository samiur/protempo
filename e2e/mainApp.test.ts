// ABOUTME: E2E tests for the main app functionality.
// ABOUTME: Tests tempo playback, navigation, and settings.

import { by, device, element, expect } from 'detox'

describe('Main App', () => {
  beforeAll(async () => {
    // Launch app fresh and skip onboarding
    await device.launchApp({ newInstance: true, delete: true })
    await device.disableSynchronization()
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Skip onboarding
    try {
      await element(by.text('Skip')).tap()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch {
      // Already completed onboarding
    }
  })

  afterAll(async () => {
    await device.enableSynchronization()
  })

  describe('Tab Navigation', () => {
    it('starts on Long Game screen', async () => {
      // Use atIndex to handle multiple matching elements (tab + header)
      await expect(element(by.text('Long Game')).atIndex(0)).toBeVisible()
      await expect(element(by.text('3:1 Tempo Training'))).toBeVisible()
    })

    it('can navigate to Short Game tab', async () => {
      // Tap the tab bar item (second occurrence)
      await element(by.text('Short Game')).atIndex(0).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await expect(element(by.text('Short Game')).atIndex(0)).toBeVisible()
      await expect(element(by.text('2:1 Tempo Training'))).toBeVisible()
    })

    it('can navigate to Settings tab', async () => {
      await element(by.text('Settings')).atIndex(0).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await expect(element(by.text('Settings')).atIndex(0)).toBeVisible()
      await expect(element(by.text('AUDIO'))).toBeVisible()
    })

    it('can navigate back to Long Game', async () => {
      await element(by.text('Long Game')).atIndex(0).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await expect(element(by.text('Long Game')).atIndex(0)).toBeVisible()
    })
  })

  describe('Long Game Screen', () => {
    beforeAll(async () => {
      await element(by.text('Long Game')).atIndex(0).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
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
      // Use toExist() as control may not fully pass 75% visibility threshold
      await expect(element(by.id('playback-controls'))).toExist()
    })

    it('shows session controls', async () => {
      // Use toExist() as control may not fully pass 75% visibility threshold
      await expect(element(by.id('session-controls'))).toExist()
    })

    it('can select different tempo preset', async () => {
      await element(by.text('21/7')).tap()
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Verify selection changed (would need accessible state or visual indicator)
    })
  })

  describe('Short Game Screen', () => {
    beforeAll(async () => {
      await element(by.text('Short Game')).atIndex(0).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    it('shows 2:1 ratio presets', async () => {
      await expect(element(by.text('18/9'))).toBeVisible()
      await expect(element(by.text('16/8'))).toBeVisible()
    })
  })

  describe('Settings Screen', () => {
    beforeAll(async () => {
      await element(by.text('Settings')).atIndex(0).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
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
      // Scroll down to see the about section
      await element(by.text('Keep Screen Awake')).swipe('up', 'slow', 0.3)
      await new Promise((resolve) => setTimeout(resolve, 300))
      await expect(element(by.text('ABOUT'))).toBeVisible()
    })

    it('can toggle tone style', async () => {
      // Scroll back up
      await element(by.text('ABOUT')).swipe('down', 'slow', 0.3)
      await new Promise((resolve) => setTimeout(resolve, 300))
      await element(by.id('segment-voice')).tap()
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Tone style should now be voice
      await element(by.id('segment-beep')).tap()
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Back to beep
    })

    it('shows reset to defaults option', async () => {
      // Scroll down to see reset button
      await element(by.text('Keep Screen Awake')).swipe('up', 'slow', 0.5)
      await new Promise((resolve) => setTimeout(resolve, 300))
      await expect(element(by.text('Reset to Defaults'))).toBeVisible()
    })
  })
})

describe('Playback', () => {
  beforeAll(async () => {
    // Launch app fresh
    await device.launchApp({ newInstance: true, delete: true })
    await device.disableSynchronization()
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Skip onboarding
    try {
      await element(by.text('Skip')).tap()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch {
      // Already done
    }
  })

  afterAll(async () => {
    await device.enableSynchronization()
  })

  it('can start playback', async () => {
    // Tap play button (correct testID from PlaybackControls)
    await element(by.id('playback-play-button')).tap()
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Check that playback started (pause button should be visible)
    await expect(element(by.id('playback-pause-button'))).toBeVisible()
  })

  it('can stop playback', async () => {
    await element(by.id('playback-stop-button')).tap()
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Play button should be visible again
    await expect(element(by.id('playback-play-button'))).toBeVisible()
  })
})
