// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { I18nProvider } from '@step-wise/i18n'

import { CountingWord } from './CountingWord.tsx'
import { loadCatalog } from '../loadCatalog.ts'

describe('CountingWord', () => {
	it('renders small cardinal and ordinal values as English words', () => {
		render(<I18nProvider locale="en" sourceLocale="en">
			<CountingWord value={3} /> <CountingWord ordinal>{12}</CountingWord>
		</I18nProvider>)
		expect(document.body.textContent).toBe('three twelfth')
	})

	it('uses numeric notation and ordinal rules for larger values', () => {
		render(<I18nProvider locale="en" sourceLocale="en">
			<CountingWord value={30} /> <CountingWord value={1000} ordinal /> <CountingWord value={44} /> <CountingWord value={22} ordinal /> <CountingWord value={113} ordinal />
		</I18nProvider>)
		expect(document.body.textContent).toBe('thirty thousandth 44 22nd 113th')
	})

	it('loads translated words and ordinal forms from the language Catalog', async () => {
		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<span><CountingWord value={12} /></span> <span><CountingWord value={22} ordinal /></span>
		</I18nProvider>)
		expect(await screen.findByText('twaalf')).toBeTruthy()
		expect(await screen.findByText('22e')).toBeTruthy()
	})

	it('rejects values that cannot be counted', () => {
		expect(() => render(<I18nProvider locale="en" sourceLocale="en"><CountingWord value={1.5} /></I18nProvider>)).toThrow('non-negative safe integer')
	})
})
