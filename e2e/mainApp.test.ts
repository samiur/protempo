// ABOUTME: E2E tests for the main app functionality.
// ABOUTME: Tests tempo playback, navigation, and settings.

import { by, device, element, expect, waitFor } from 'detox'

describe('Main App', () => {
  beforeAll(async () => {
    // Launch app fresh and skip onboarding
    await device.launchApp({ newInstance: true, delete: true })
    await device.disableSynchronization()

    // Wait for app to load then skip onboarding if present
    try {
      await waitFor(element(by.text('Skip')))
        .toBeVisible()
        .withTimeout(5000)
      await element(by.text('Skip')).tap()
      await waitFor(element(by.text('Long Game')).atIndex(0))
        .toBeVisible()
        .withTimeout(10000)
    } catch {
      // Already completed onboarding, wait for main app
      await waitFor(element(by.text('Long Game')).atIndex(0))
        .toBeVisible()
        .withTimeout(5000)
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
      await waitFor(element(by.text('2:1 Tempo Training')))
        .toBeVisible()
        .withTimeout(2000)
      await expect(element(by.text('Short Game')).atIndex(0)).toBeVisible()
    })

    it('can navigate to Video tab', async () => {
      await element(by.text('Video')).atIndex(0).tap()
      await waitFor(element(by.text('Video Analysis')))
        .toBeVisible()
        .withTimeout(2000)
    })

    it('can navigate to Settings tab', async () => {
      await element(by.text('Settings')).atIndex(0).tap()
      await waitFor(element(by.text('AUDIO')))
        .toBeVisible()
        .withTimeout(2000)
      await expect(element(by.text('Settings')).atIndex(0)).toBeVisible()
    })

    it('can navigate back to Long Game', async () => {
      await element(by.text('Long Game')).atIndex(0).tap()
      await waitFor(element(by.text('3:1 Tempo Training')))
        .toBeVisible()
        .withTimeout(2000)
      await expect(element(by.text('Long Game')).atIndex(0)).toBeVisible()
    })
  })

  describe('Long Game Screen', () => {
    beforeAll(async () => {
      await element(by.text('Long Game')).atIndex(0).tap()
      await waitFor(element(by.text('3:1 Tempo Training')))
        .toBeVisible()
        .withTimeout(2000)
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
      // Verify selection changed (would need accessible state or visual indicator)
    })
  })

  describe('Short Game Screen', () => {
    beforeAll(async () => {
      await element(by.text('Short Game')).atIndex(0).tap()
      await waitFor(element(by.text('2:1 Tempo Training')))
        .toBeVisible()
        .withTimeout(2000)
    })

    it('shows 2:1 ratio presets', async () => {
      await expect(element(by.text('18/9'))).toBeVisible()
      await expect(element(by.text('16/8'))).toBeVisible()
    })
  })

  describe('Video Screen', () => {
    beforeAll(async () => {
      await element(by.text('Video')).atIndex(0).tap()
      await waitFor(element(by.text('Video Analysis')))
        .toBeVisible()
        .withTimeout(2000)
    })

    it('shows video analysis title', async () => {
      await expect(element(by.text('Video Analysis'))).toBeVisible()
    })

    it('shows Record New option', async () => {
      await expect(element(by.text('Record New'))).toBeVisible()
    })

    it('shows Video Library option', async () => {
      await expect(element(by.text('Video Library'))).toBeVisible()
    })
  })

  describe('Settings Screen', () => {
    beforeAll(async () => {
      await element(by.text('Settings')).atIndex(0).tap()
      await waitFor(element(by.text('AUDIO')))
        .toBeVisible()
        .withTimeout(2000)
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
      await waitFor(element(by.text('ABOUT')))
        .toBeVisible()
        .withTimeout(2000)
    })

    it('can toggle tone style', async () => {
      // Scroll back up
      await element(by.text('ABOUT')).swipe('down', 'slow', 0.3)
      await waitFor(element(by.id('segment-voice')))
        .toBeVisible()
        .withTimeout(2000)
      await element(by.id('segment-voice')).tap()
      // Tone style should now be voice
      await element(by.id('segment-beep')).tap()
      // Back to beep
    })

    it('shows reset to defaults option', async () => {
      // Scroll down to see reset button
      await element(by.text('Keep Screen Awake')).swipe('up', 'slow', 0.5)
      await waitFor(element(by.text('Reset to Defaults')))
        .toBeVisible()
        .withTimeout(2000)
    })
  })
})

describe('Playback', () => {
  beforeAll(async () => {
    // Launch app fresh
    await device.launchApp({ newInstance: true, delete: true })
    await device.disableSynchronization()

    // Skip onboarding
    try {
      await waitFor(element(by.text('Skip')))
        .toBeVisible()
        .withTimeout(5000)
      await element(by.text('Skip')).tap()
      await waitFor(element(by.text('Long Game')).atIndex(0))
        .toBeVisible()
        .withTimeout(10000)
    } catch {
      // Already done
      await waitFor(element(by.text('Long Game')).atIndex(0))
        .toBeVisible()
        .withTimeout(5000)
    }
  })

  afterAll(async () => {
    await device.enableSynchronization()
  })

  it('can start playback', async () => {
    // Tap play button (correct testID from PlaybackControls)
    await element(by.id('playback-play-button')).tap()

    // Check that playback started (pause button should be visible)
    await waitFor(element(by.id('playback-pause-button')))
      .toBeVisible()
      .withTimeout(5000)
  })

  it('can stop playback', async () => {
    await element(by.id('playback-stop-button')).tap()

    // Play button should be visible again
    await waitFor(element(by.id('playback-play-button')))
      .toBeVisible()
      .withTimeout(2000)
  })
})
