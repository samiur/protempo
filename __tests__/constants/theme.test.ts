// ABOUTME: Tests for theme constants.
// ABOUTME: Verifies color values and type exports.

import { colors, spacing, fontSizes } from '../../constants/theme'

describe('Theme Constants', () => {
  describe('colors', () => {
    it('defines background color', () => {
      expect(colors.background).toBe('#121212')
    })

    it('defines surface color', () => {
      expect(colors.surface).toBe('#1E1E1E')
    })

    it('defines primary color', () => {
      expect(colors.primary).toBe('#4CAF50')
    })

    it('defines text color', () => {
      expect(colors.text).toBe('#FFFFFF')
    })

    it('defines textSecondary color', () => {
      expect(colors.textSecondary).toBe('#B0B0B0')
    })

    it('defines border color', () => {
      expect(colors.border).toBe('#333333')
    })

    it('defines inactive color', () => {
      expect(colors.inactive).toBe('#666666')
    })

    it('all colors are valid hex values', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/
      Object.values(colors).forEach((color) => {
        expect(color).toMatch(hexRegex)
      })
    })
  })

  describe('spacing', () => {
    it('defines spacing values in ascending order', () => {
      expect(spacing.xs).toBeLessThan(spacing.sm)
      expect(spacing.sm).toBeLessThan(spacing.md)
      expect(spacing.md).toBeLessThan(spacing.lg)
      expect(spacing.lg).toBeLessThan(spacing.xl)
    })

    it('defines xs as 4', () => {
      expect(spacing.xs).toBe(4)
    })

    it('defines md as 16', () => {
      expect(spacing.md).toBe(16)
    })
  })

  describe('fontSizes', () => {
    it('defines font sizes in ascending order', () => {
      expect(fontSizes.sm).toBeLessThan(fontSizes.md)
      expect(fontSizes.md).toBeLessThan(fontSizes.lg)
      expect(fontSizes.lg).toBeLessThan(fontSizes.xl)
      expect(fontSizes.xl).toBeLessThan(fontSizes.xxl)
    })

    it('defines md as 16', () => {
      expect(fontSizes.md).toBe(16)
    })

    it('defines xxl as 32', () => {
      expect(fontSizes.xxl).toBe(32)
    })
  })
})
