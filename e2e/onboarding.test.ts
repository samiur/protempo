// ABOUTME: E2E tests for the onboarding flow.
// ABOUTME: Verifies first-launch experience, navigation, and completion.

import { by, device, element, expect } from 'detox'

describe('Onboarding Flow', () => {
  describe('First Launch', () => {
    beforeEach(async () => {
      // Uninstall and reinstall to simulate first launch
      await device.launchApp({ newInstance: true, delete: true })
      await device.disableSynchronization()
      await new Promise((resolve) => setTimeout(resolve, 3000))
    })

    afterEach(async () => {
      await device.enableSynchronization()
    })

    it('shows onboarding screen on first launch', async () => {
      await expect(element(by.id('onboarding-screen'))).toBeVisible()
    })

    it('shows first page with tempo explanation', async () => {
      await expect(element(by.text('What is Golf Tempo?'))).toBeVisible()
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
    beforeAll(async () => {
      await device.launchApp({ newInstance: true, delete: true })
      await device.disableSynchronization()
      await new Promise((resolve) => setTimeout(resolve, 3000))
    })

    afterAll(async () => {
      await device.enableSynchronization()
    })

    it('navigates to page 2 when Next is pressed', async () => {
      await element(by.text('Next')).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await expect(element(by.text('Three Simple Tones'))).toBeVisible()
    })

    it('shows Back button on page 2', async () => {
      await expect(element(by.text('Back'))).toBeVisible()
    })

    it('navigates back to page 1 when Back is pressed', async () => {
      await element(by.text('Back')).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await expect(element(by.text('What is Golf Tempo?'))).toBeVisible()
    })

    it('navigates to page 3 from page 2', async () => {
      await element(by.text('Next')).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await element(by.text('Next')).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await expect(element(by.text('Start with 24/8'))).toBeVisible()
    })

    it('shows Get Started button on page 3', async () => {
      await expect(element(by.text('Get Started'))).toBeVisible()
    })
  })

  describe('Completion', () => {
    afterEach(async () => {
      await device.enableSynchronization()
    })

    it('completes onboarding and shows main app when Get Started is pressed', async () => {
      await device.launchApp({ newInstance: true, delete: true })
      await device.disableSynchronization()
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Navigate through all pages
      await element(by.text('Next')).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await element(by.text('Next')).tap()
      await new Promise((resolve) => setTimeout(resolve, 500))
      await element(by.text('Get Started')).tap()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Should now be on the main app (Long Game screen)
      await expect(element(by.text('Long Game')).atIndex(0)).toBeVisible()
    })

    it('completes onboarding when Skip is pressed', async () => {
      await device.launchApp({ newInstance: true, delete: true })
      await device.disableSynchronization()
      await new Promise((resolve) => setTimeout(resolve, 3000))

      await element(by.text('Skip')).tap()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Should now be on the main app
      await expect(element(by.text('Long Game')).atIndex(0)).toBeVisible()
    })
  })

  describe('Persistence', () => {
    afterAll(async () => {
      await device.enableSynchronization()
    })

    it('does not show onboarding on subsequent launches after completion', async () => {
      // First launch - complete onboarding
      await device.launchApp({ newInstance: true, delete: true })
      await device.disableSynchronization()
      await new Promise((resolve) => setTimeout(resolve, 3000))

      await element(by.text('Skip')).tap()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await expect(element(by.text('Long Game')).atIndex(0)).toBeVisible()

      // Relaunch the app (without delete)
      await device.launchApp({ newInstance: true })
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Should go straight to main app, not onboarding
      await expect(element(by.text('Long Game')).atIndex(0)).toBeVisible()
    })
  })
})
