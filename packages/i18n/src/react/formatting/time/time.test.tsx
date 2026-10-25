// @vitest-environment jsdom

import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { reactToMessage } from '../../conversion/reactToMessage.ts'
import { I18nProvider } from '../../context/I18nProvider.tsx'
import { LocalizedDuration } from './LocalizedDuration.tsx'
import { RelativeTime } from './RelativeTime.tsx'

describe('LocalizedDuration', () => {
	it('formats durations according to the active locale', () => {
		const { container, rerender } = render(<I18nProvider locale="en" sourceLocale="en">
			<LocalizedDuration milliseconds={3 * 60 * 1000} />
		</I18nProvider>)
		expect(container.textContent).toBe('3 minutes')

		rerender(<I18nProvider locale="nl" sourceLocale="en">
			<LocalizedDuration milliseconds={3 * 60 * 1000} />
		</I18nProvider>)
		expect(container.textContent).toBe('3 minuten')
	})

	it('respects the smallest unit', () => {
		const { container } = render(<I18nProvider locale="en" sourceLocale="en">
			<LocalizedDuration milliseconds={45 * 1000} smallestUnit="second" />
		</I18nProvider>)
		expect(container.textContent).toBe('45 seconds')
	})
})

describe('RelativeTime', () => {
	afterEach(() => vi.useRealTimers())

	it('formats past and future dates', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
		const { container, rerender } = render(<I18nProvider locale="en" sourceLocale="en">
			<RelativeTime date="2026-01-01T11:55:00Z" />
		</I18nProvider>)
		expect(container.textContent).toBe('5 minutes ago')

		rerender(<I18nProvider locale="en" sourceLocale="en">
			<RelativeTime date="2026-01-01T12:05:00Z" />
		</I18nProvider>)
		expect(container.textContent).toBe('in 5 minutes')
	})

	it('renders now below the selected precision', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
		const { container } = render(<I18nProvider locale="en" sourceLocale="en">
			<RelativeTime date="2026-01-01T11:59:40Z" />
		</I18nProvider>)
		expect(container.textContent).toBe('now')
	})

	it('updates when the displayed value changes', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
		const { container } = render(<I18nProvider locale="en" sourceLocale="en">
			<RelativeTime date="2026-01-01T11:55:00Z" />
		</I18nProvider>)
		expect(container.textContent).toBe('5 minutes ago')

		act(() => vi.advanceTimersByTime(30 * 1000))
		expect(container.textContent).toBe('6 minutes ago')
	})

	it('is opaque within an outer translation', () => {
		expect(reactToMessage(<RelativeTime date="2026-01-01T12:00:00Z" />)).toEqual([{
			type: 'component',
			id: 'c1',
			component: 'relative-time',
			slots: {},
		}])
	})
})
