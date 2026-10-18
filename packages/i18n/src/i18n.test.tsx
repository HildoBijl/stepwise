// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { Trans } from '@lingui/react'
import { describe, expect, it } from 'vitest'

import { I18nProvider, setupI18n } from './index.ts'

describe('I18nProvider', () => {
	it('renders and updates translated messages', () => {
		const i18n = setupI18n({
			locale: 'en',
			messages: {
				en: { greeting: 'Hello' },
				nl: { greeting: 'Hallo' },
			},
		})
		const view = render(<I18nProvider i18n={i18n}><Trans id="greeting" message="Hello" /></I18nProvider>)
		expect(screen.getByText('Hello')).toBeTruthy()

		i18n.activate('nl')
		view.rerender(<I18nProvider i18n={i18n}><Trans id="greeting" message="Hello" /></I18nProvider>)
		expect(screen.getByText('Hallo')).toBeTruthy()
	})
})
