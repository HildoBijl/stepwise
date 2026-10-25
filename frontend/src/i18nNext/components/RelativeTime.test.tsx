// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { I18nProvider } from '@step-wise/i18n'

import { loadCatalog } from '../loadCatalog.ts'
import { RelativeTime } from './RelativeTime.tsx'

describe('RelativeTime', () => {
	it('renders Never for an absent date', async () => {
		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<RelativeTime />
		</I18nProvider>)
		expect(await screen.findByText('Nooit')).toBeTruthy()
	})
})
