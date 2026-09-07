// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import './testSetup.ts'
import { useAnimation, useCoalescedCallback } from './scheduling.ts'

let callbacks: Map<number, FrameRequestCallback>
let nextRequest: number

function runFrame(time: number): void {
	const pendingCallbacks = [...callbacks.values()]
	callbacks.clear()
	pendingCallbacks.forEach(callback => callback(time))
}

beforeEach(() => {
	callbacks = new Map()
	nextRequest = 1
	vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
		const request = nextRequest++
		callbacks.set(request, callback)
		return request
	}))
	vi.stubGlobal('cancelAnimationFrame', vi.fn((request: number) => callbacks.delete(request)))
})

describe('useAnimation', () => {
	it('tracks elapsed time while excluding pauses', () => {
		const callback = vi.fn()
		const { rerender } = renderHook(({ active }) => useAnimation(callback, { active }), { initialProps: { active: true } })
		act(() => runFrame(100))
		act(() => runFrame(116))
		expect(callback).toHaveBeenLastCalledWith(16, 16)

		rerender({ active: false })
		rerender({ active: true })
		act(() => runFrame(500))
		expect(callback).toHaveBeenLastCalledWith(16, undefined)
	})

	it('cancels its pending frame when unmounted', () => {
		const { unmount } = renderHook(() => useAnimation(() => undefined))
		unmount()
		expect(cancelAnimationFrame).toHaveBeenCalled()
		expect(callbacks.size).toBe(0)
	})
})

describe('useCoalescedCallback', () => {
	it('runs once per frame with the latest arguments', () => {
		const callback = vi.fn()
		const { result } = renderHook(() => useCoalescedCallback(callback))
		act(() => {
			result.current(1)
			result.current(2)
			runFrame(100)
		})
		expect(callback).toHaveBeenCalledOnce()
		expect(callback).toHaveBeenCalledWith(2)
	})

	it('cancels pending work when unmounted', () => {
		const callback = vi.fn()
		const { result, unmount } = renderHook(() => useCoalescedCallback(callback))
		act(() => result.current())
		unmount()
		act(() => runFrame(100))
		expect(callback).not.toHaveBeenCalled()
	})
})
