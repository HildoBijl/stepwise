// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import './testSetup.ts'
import { useLocalStorageState } from './localStorageState.ts'

describe('useLocalStorageState', () => {
	beforeEach(() => localStorage.clear())

	it('uses an initial value and stores direct and functional updates', () => {
		const { result } = renderHook(() => useLocalStorageState('count', 2))
		expect(result.current[0]).toBe(2)

		act(() => result.current[1](3))
		expect(result.current[0]).toBe(3)
		expect(JSON.parse(localStorage.getItem('count')!)).toBe(3)

		act(() => result.current[1](value => (value ?? 0) + 1))
		expect(result.current[0]).toBe(4)
	})

	it('reacts to external changes without writing them back', () => {
		const { result } = renderHook(() => useLocalStorageState('count', 1))
		act(() => {
			localStorage.setItem('count', '5')
			window.dispatchEvent(new StorageEvent('storage', { key: 'count', storageArea: localStorage }))
		})
		expect(result.current[0]).toBe(5)
		expect(localStorage.getItem('count')).toBe('5')
	})

	it('reinitializes and parses values when the key changes', () => {
		localStorage.setItem('first', '"3"')
		localStorage.setItem('second', '"4"')
		const parse = (value: unknown) => Number(value)
		const { result, rerender } = renderHook(({ storageKey }) => useLocalStorageState(storageKey, 0, { parse }), { initialProps: { storageKey: 'first' } })
		expect(result.current[0]).toBe(3)
		rerender({ storageKey: 'second' })
		expect(result.current[0]).toBe(4)
	})
})
