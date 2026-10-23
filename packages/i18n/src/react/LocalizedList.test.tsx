// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { reactToMessage } from './conversion/reactToMessage.ts'
import { I18nProvider } from './context/I18nProvider.tsx'
import { LocalizedList } from './LocalizedList.tsx'

describe('LocalizedList', () => {
	it('formats conjunctions according to the active locale', () => {
		const { rerender } = render(<I18nProvider locale="en" sourceLocale="en">
			<LocalizedList items={['Alex', 'Bob', 'Carl']} />
		</I18nProvider>)
		expect(document.body.textContent).toBe('Alex, Bob, and Carl')

		rerender(<I18nProvider locale="nl" sourceLocale="en">
			<LocalizedList items={['Alex', 'Bob', 'Carl']} />
		</I18nProvider>)
		expect(document.body.textContent).toBe('Alex, Bob en Carl')
	})

	it('retains React elements in the formatted list', () => {
		const { container } = render(<I18nProvider locale="en" sourceLocale="en">
			<LocalizedList items={[<strong key="alex">Alex</strong>, <em key="bob">Bob</em>]} type="disjunction" />
		</I18nProvider>)

		expect(screen.getByText('Alex').tagName).toBe('STRONG')
		expect(screen.getByText('Bob').tagName).toBe('EM')
		expect(container.textContent).toBe('Alex or Bob')
	})

	it('is opaque within an outer translation', () => {
		expect(reactToMessage(<LocalizedList items={['Alex', 'Bob']} />)).toEqual([{
			type: 'component',
			id: 'c1',
			component: 'localized-list',
			slots: {},
		}])
	})
})
