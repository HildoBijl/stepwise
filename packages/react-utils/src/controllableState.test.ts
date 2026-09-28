// @vitest-environment jsdom

import { useState } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import './testSetup.ts'
import { type StateHandle, useControllableState } from './controllableState.ts'

describe('useControllableState', () => {
	it('uses internal state when no handle is provided', () => {
		const initialize = vi.fn(() => 2)
		const { result } = renderHook(() => useControllableState(undefined, initialize))

		expect(result.current[0]).toBe(2)
		expect(initialize).toHaveBeenCalledOnce()

		act(() => result.current[1](3))
		expect(result.current[0]).toBe(3)

		act(() => result.current[1](value => value + 1))
		expect(result.current[0]).toBe(4)
	})

	it('uses the provided handle without evaluating the internal initializer', () => {
		const initialize = vi.fn(() => 10)
		const { result } = renderHook(() => {
			const externalHandle = useState(2)
			return useControllableState(externalHandle, initialize)
		})

		expect(result.current[0]).toBe(2)
		expect(initialize).not.toHaveBeenCalled()

		act(() => result.current[1](value => value + 1))
		expect(result.current[0]).toBe(3)
	})

	it('rejects an incomplete state handle', () => {
		expect(() => renderHook(() => useControllableState([1] as unknown as StateHandle<number>, 0))).toThrow('Invalid state handle')
	})

	it('rejects switching between internal and controlled state', () => {
		const setValue = vi.fn()
		const { rerender } = renderHook(({ handle }) => useControllableState(handle, 0), {
			initialProps: { handle: undefined as StateHandle<number> | undefined },
		})

		expect(() => rerender({ handle: [1, setValue] })).toThrow('Unexpected value change')
	})
})
