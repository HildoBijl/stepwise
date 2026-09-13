// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HorizontalScroller } from './HorizontalScroller.tsx'

const resizeCallbacks = new Map<Element, ResizeObserverCallback>()

class ResizeObserverMock {
	readonly callback: ResizeObserverCallback
	constructor(callback: ResizeObserverCallback) {
		this.callback = callback
	}
	observe(target: Element) { resizeCallbacks.set(target, this.callback) }
	disconnect() {}
}

beforeEach(() => {
	resizeCallbacks.clear()
	vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
		return this.classList.contains('horizontalScroller') ? 100 : 0
	})
	vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
		return this.classList.contains('horizontalScrollerContents') ? 250 : 0
	})
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		return { left: 0, width: this.classList.contains('horizontalScroller') ? 100 : 0 } as DOMRect
	})
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('HorizontalScroller', () => {
	it('renders its contents and activates for horizontal overflow', () => {
		render(<HorizontalScroller><span>Wide contents</span></HorizontalScroller>)
		expect(screen.getByText('Wide contents')).toBeTruthy()
		expect(screen.getByRole('scrollbar').getAttribute('aria-valuenow')).toBe('0')
	})

	it('updates the scroll position through its scrollbar', () => {
		render(<HorizontalScroller><span>Wide contents</span></HorizontalScroller>)
		const scrollbar = screen.getByRole('scrollbar')
		fireEvent.pointerDown(scrollbar, { clientX: 75, pointerType: 'mouse' })
		expect(scrollbar.getAttribute('aria-valuenow')).toBe('92')
	})

	it('supports keyboard scrolling', () => {
		render(<HorizontalScroller><span>Wide contents</span></HorizontalScroller>)
		const scrollbar = screen.getByRole('scrollbar')
		fireEvent.keyDown(scrollbar, { key: 'ArrowRight' })
		expect(scrollbar.getAttribute('aria-valuenow')).toBe('10')
		fireEvent.keyDown(scrollbar, { key: 'End' })
		expect(scrollbar.getAttribute('aria-valuenow')).toBe('100')
	})

	it('reacts when observed dimensions change', () => {
		const { container } = render(<HorizontalScroller><span>Wide contents</span></HorizontalScroller>)
		const contents = container.querySelector('.horizontalScrollerContents')!
		expect(screen.getByRole('scrollbar')).toBeTruthy()
		vi.spyOn(contents, 'scrollWidth', 'get').mockReturnValue(80)
		act(() => resizeCallbacks.get(contents)?.([{ target: contents } as ResizeObserverEntry], {} as ResizeObserver))
		expect(screen.queryByRole('scrollbar')).toBeNull()
	})
})
