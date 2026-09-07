// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import './testSetup.ts'
import { usePointerPosition, usePointerState } from './pointerEvents.ts'

let frameCallback: FrameRequestCallback | undefined

beforeEach(() => {
	frameCallback = undefined
	vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
		frameCallback = callback
		return 1
	}))
	vi.stubGlobal('cancelAnimationFrame', vi.fn(() => { frameCallback = undefined }))
})

function flushFrame(): void {
	const callback = frameCallback
	frameCallback = undefined
	callback?.(0)
}

describe('pointer state', () => {
	it('tracks pointer coordinates and modifier keys', () => {
		const { result } = renderHook(() => usePointerState())
		act(() => {
			window.dispatchEvent(new MouseEvent('pointermove', { clientX: 12, clientY: 34, shiftKey: true }))
			flushFrame()
		})
		expect(result.current.position?.x).toBe(12)
		expect(result.current.position?.y).toBe(34)
		expect(result.current.modifierKeys.shift).toBe(true)
	})

	it('coalesces pointer updates and exposes the position-only hook', () => {
		const { result } = renderHook(() => usePointerPosition())
		act(() => {
			window.dispatchEvent(new MouseEvent('pointermove', { clientX: 1, clientY: 2 }))
			window.dispatchEvent(new MouseEvent('pointermove', { clientX: 3, clientY: 4 }))
		})
		expect(requestAnimationFrame).toHaveBeenCalledOnce()
		act(flushFrame)
		expect(result.current?.x).toBe(3)
		expect(result.current?.y).toBe(4)
	})

	it('clears pointer data when the window loses focus', () => {
		const { result } = renderHook(() => usePointerState())
		act(() => {
			window.dispatchEvent(new MouseEvent('pointermove', { clientX: 1, clientY: 2, ctrlKey: true }))
			flushFrame()
			window.dispatchEvent(new Event('blur'))
		})
		expect(result.current.position).toBeUndefined()
		expect(result.current.modifierKeys.ctrl).toBe(false)
	})

	it('stops tracking and cancels pending updates after unmounting', () => {
		const removeListener = vi.spyOn(window, 'removeEventListener')
		const { unmount } = renderHook(() => usePointerState())
		act(() => window.dispatchEvent(new MouseEvent('pointermove')))
		unmount()
		expect(cancelAnimationFrame).toHaveBeenCalledWith(1)
		expect(removeListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
	})
})
