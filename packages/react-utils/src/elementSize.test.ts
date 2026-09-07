// @vitest-environment jsdom

import { createRef } from 'react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import './testSetup.ts'
import { useElementBounds, useElementMeasurement, useElementSize, useResizeObserver } from './elementSize.ts'

let resizeCallback: ResizeObserverCallback
const observe = vi.fn()
const disconnect = vi.fn()

class ResizeObserverMock {
	constructor(callback: ResizeObserverCallback) {
		resizeCallback = callback
	}
	observe = observe
	disconnect = disconnect
}

beforeEach(() => {
	observe.mockClear()
	disconnect.mockClear()
	vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		callback(0)
		return 1
	})
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

describe('useResizeObserver', () => {
	it('observes an element and disconnects on cleanup', () => {
		const element = document.createElement('div')
		const callback = vi.fn()
		const { unmount } = renderHook(() => useResizeObserver(element, callback))
		expect(observe).toHaveBeenCalledWith(element, undefined)
		act(() => resizeCallback([{ target: element } as ResizeObserverEntry], {} as ResizeObserver))
		expect(callback).toHaveBeenCalledOnce()
		unmount()
		expect(disconnect).toHaveBeenCalledOnce()
	})

	it('does nothing without an element', () => {
		renderHook(() => useResizeObserver(null, () => undefined))
		expect(observe).not.toHaveBeenCalled()
	})
})

describe('element measurements', () => {
	it('measures custom values initially and after resize notifications', () => {
		const element = document.createElement('div')
		let measurement = 2
		const { result } = renderHook(() => useElementMeasurement(element, () => measurement))
		expect(result.current).toBe(2)
		measurement = 3
		act(() => resizeCallback([{ target: element } as ResizeObserverEntry], {} as ResizeObserver))
		expect(result.current).toBe(3)
	})

	it('reports element size and undefined for a missing element', () => {
		const element = document.createElement('div')
		Object.defineProperties(element, { offsetWidth: { value: 120 }, offsetHeight: { value: 45 } })
		const measured = renderHook(() => useElementSize(element))
		expect(measured.result.current).toEqual({ width: 120, height: 45 })
		const missing = renderHook(() => useElementSize(createRef<HTMLDivElement>()))
		expect(missing.result.current).toBeUndefined()
	})

	it('updates bounds after window layout events', () => {
		const element = document.createElement('div')
		let x = 1
		vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => ({ x, y: 2, width: 3, height: 4 } as DOMRect))
		const { result } = renderHook(() => useElementBounds(element))
		expect(result.current?.x).toBe(1)
		x = 5
		act(() => window.dispatchEvent(new Event('resize')))
		expect(result.current?.x).toBe(5)
	})
})
