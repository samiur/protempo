// ABOUTME: E2E tests for the onboarding flow.
// ABOUTME: Verifies first-launch experience, navigation, and completion.

import { by, device, element, expect } from 'detox'

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  beforeEach(async () => {
    await device.reloadReactNative()
    // Clear AsyncStorage to simulate first launch
    await device.clearKeychain()
  })

  describe('First Launch', () => {
    it('shows onboarding screen on first launch', async () => {
      // The app should redirect to onboarding for new users
      await expect(element(by.id('onboarding-screen'))).toBeVisible()
    })

    it('shows first page with tempo explanation', async () => {
      await expect(element(by.text('What is Golf Tempo?'))).toBeVisible()
      await expect(element(by.text(/3:1/))).toBeVisible()
    })

    it('shows skip button', async () => {
      await expect(element(by.text('Skip'))).toBeVisible()
    })

    it('shows page indicators', async () => {
      await expect(element(by.id('page-indicator-0'))).toBeVisible()
      await expect(element(by.id('page-indicator-1'))).toBeVisible()
      await expect(element(by.id('page-indicator-2'))).toBeVisible()
    })
  })

  describe('Navigation', () => {
    it('navigates to page 2 when Next is pressed', async () => {
      await element(by.text('Next')).tap()
      await expect(element(by.text('Three Simple Tones'))).toBeVisible()
    })

    it('shows Back button on page 2', async () => {
      await element(by.text('Next')).tap()
      await expect(element(by.text('Back'))).toBeVisible()
    })

    it('navigates back to page 1 when Back is pressed', async () => {
      await element(by.text('Next')).tap()
      await element(by.text('Back')).tap()
      await expect(element(by.text('What is Golf Tempo?'))).toBeVisible()
    })

    it('navigates to page 3 from page 2', async () => {
      await element(by.text('Next')).tap()
      await element(by.text('Next')).tap()
      await expect(element(by.text('Start with 24/8'))).toBeVisible()
    })

    it('shows Get Started button on page 3', async () => {
      await element(by.text('Next')).tap()
      await element(by.text('Next')).tap()
      await expect(element(by.text('Get Started'))).toBeVisible()
      await expect(element(by.text('Next'))).not.toBeVisible()
    })
  })

  describe('Completion', () => {
    it('completes onboarding and shows main app when Get Started is pressed', async () => {
      // Navigate through all pages
      await element(by.text('Next')).tap()
      await element(by.text('Next')).tap()
      await element(by.text('Get Started')).tap()

      // Should now be on the main app (Long Game screen)
      await expect(element(by.text('Long Game'))).toBeVisible()
      await expect(element(by.id('onboarding-screen'))).not.toBeVisible()
    })

    it('completes onboarding when Skip is pressed', async () => {
      await element(by.text('Skip')).tap()

      // Should now be on the main app
      await expect(element(by.text('Long Game'))).toBeVisible()
    })
  })

  describe('Persistence', () => {
    it('does not show onboarding on subsequent launches after completion', async () => {
      // Complete onboarding
      await element(by.text('Skip')).tap()
      await expect(element(by.text('Long Game'))).toBeVisible()

      // Reload the app
      await device.reloadReactNative()

      // Should go straight to main app, not onboarding
      await expect(element(by.text('Long Game'))).toBeVisible()
      await expect(element(by.id('onboarding-screen'))).not.toBeVisible()
    })
  })
})
