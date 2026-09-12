// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import './testSetup.ts'
import { useSessionStorageState } from './sessionStorageState.ts'

describe('useSessionStorageState', () => {
	beforeEach(() => sessionStorage.clear())

	it('uses an initial value and stores direct and functional updates', () => {
		const { result } = renderHook(() => useSessionStorageState('count', 2))
		expect(result.current[0]).toBe(2)

		act(() => result.current[1](3))
		expect(result.current[0]).toBe(3)
		expect(JSON.parse(sessionStorage.getItem('count')!)).toBe(3)

		act(() => result.current[1](value => (value ?? 0) + 1))
		expect(result.current[0]).toBe(4)
	})

	it('reacts to external changes without writing them back', () => {
		const { result } = renderHook(() => useSessionStorageState('count', 1))
		act(() => {
			sessionStorage.setItem('count', '5')
			window.dispatchEvent(new StorageEvent('storage', { key: 'count', storageArea: sessionStorage }))
		})
		expect(result.current[0]).toBe(5)
		expect(sessionStorage.getItem('count')).toBe('5')
	})

	it('reinitializes and parses values when the key changes', () => {
		sessionStorage.setItem('first', '"3"')
		sessionStorage.setItem('second', '"4"')
		const parse = (value: unknown) => Number(value)
		const { result, rerender } = renderHook(({ storageKey }) => useSessionStorageState(storageKey, 0, { parse }), { initialProps: { storageKey: 'first' } })
		expect(result.current[0]).toBe(3)
		rerender({ storageKey: 'second' })
		expect(result.current[0]).toBe(4)
	})
})
