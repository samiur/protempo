// ABOUTME: Tests for SettingsSection component.
// ABOUTME: Verifies section header and children rendering.

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import SettingsSection from '../../../components/settings/SettingsSection'

describe('SettingsSection', () => {
  describe('rendering', () => {
    it('renders section title', () => {
      render(<SettingsSection title="AUDIO" />)

      expect(screen.getByText('AUDIO')).toBeTruthy()
    })

    it('renders different titles correctly', () => {
      const { rerender } = render(<SettingsSection title="DEFAULTS" />)
      expect(screen.getByText('DEFAULTS')).toBeTruthy()

      rerender(<SettingsSection title="DISPLAY" />)
      expect(screen.getByText('DISPLAY')).toBeTruthy()
    })

    it('renders children content', () => {
      render(
        <SettingsSection title="TEST">
          <Text>Child content</Text>
        </SettingsSection>
      )

      expect(screen.getByText('Child content')).toBeTruthy()
    })

    it('renders multiple children', () => {
      render(
        <SettingsSection title="TEST">
          <Text>First child</Text>
          <Text>Second child</Text>
        </SettingsSection>
      )

      expect(screen.getByText('First child')).toBeTruthy()
      expect(screen.getByText('Second child')).toBeTruthy()
    })

    it('renders container with testID', () => {
      render(<SettingsSection title="AUDIO" />)

      expect(screen.getByTestId('settings-section-AUDIO')).toBeTruthy()
    })

    it('renders empty section without children', () => {
      render(<SettingsSection title="EMPTY" />)

      expect(screen.getByTestId('settings-section-EMPTY')).toBeTruthy()
    })
  })
})
