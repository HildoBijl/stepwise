// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { DrawingHandle } from '../Drawing/types.ts'
import { DrawingTarget } from '../DrawingTargets/index.ts'

import { MeasuredDrawing } from './MeasuredDrawing.tsx'

beforeEach(() => {
	vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		if (this.style.position === 'relative') return rectangle(0, 0, Number.parseFloat(this.style.width), Number.parseFloat(this.style.height))
		if (this.dataset.testid === 'first') return rectangle(10, 20, 30, 40)
		if (this.dataset.testid === 'second') return rectangle(70, 50, 20, 30)
		return rectangle(0, 0, 200, 100)
	})
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('MeasuredDrawing', () => {
	test('passes target bounds to the calculation by target name', () => {
		const calculateView = vi.fn(({ first, second }: { first: { left: number }, second: { bottom: number } }, coordinateSystem: { width: number, height: number }) => ({
			type: 'identity' as const,
			width: 200,
			height: second.bottom + first.left,
		}))
		const ref = createRef<DrawingHandle>()

		const { container } = render(<MeasuredDrawing calculateView={calculateView} ref={ref} targets={['first', 'second']}>
			<DrawingTarget data-testid="first" target="first">First</DrawingTarget>
			<DrawingTarget data-testid="second" target="second">Second</DrawingTarget>
		</MeasuredDrawing>)

		expect(calculateView).toHaveBeenCalled()
		expect([calculateView.mock.calls[0][1].width, calculateView.mock.calls[0][1].height]).toEqual([800, 600])
		const [{ first: firstBounds, second: secondBounds }] = calculateView.mock.lastCall!
		expect([firstBounds.left, firstBounds.top, firstBounds.right, firstBounds.bottom]).toEqual([10, 20, 40, 60])
		expect([secondBounds.left, secondBounds.top, secondBounds.right, secondBounds.bottom]).toEqual([70, 50, 90, 80])
		expect(ref.current?.width).toBe(200)
		expect(ref.current?.height).toBe(90)
		expect((container.firstElementChild as HTMLElement).style.visibility).not.toBe('hidden')
	})

	test('uses a hidden 800 by 600 drawing until every target is available', () => {
		const calculateView = vi.fn(() => ({ type: 'identity' as const, width: 100, height: 100 }))
		const ref = createRef<DrawingHandle>()

		const { container } = render(<MeasuredDrawing calculateView={calculateView} ref={ref} targets={['available', 'missing']}>
			<DrawingTarget target="available">Available</DrawingTarget>
		</MeasuredDrawing>)

		expect(calculateView).not.toHaveBeenCalled()
		expect(ref.current?.width).toBe(800)
		expect(ref.current?.height).toBe(600)
		expect((container.firstElementChild as HTMLElement).style.visibility).toBe('hidden')
		expect(screen.getByText('Available')).toBeTruthy()
	})
})

class ResizeObserverMock {
	constructor(private readonly callback: ResizeObserverCallback) {}

	observe() {
		this.callback([], this as unknown as ResizeObserver)
	}

	disconnect() {}
	unobserve() {}
}

function rectangle(left: number, top: number, width: number, height: number): DOMRect {
	return { left, top, width, height, right: left + width, bottom: top + height } as DOMRect
}
