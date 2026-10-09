// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { DrawingHandle } from '../Drawing/types.ts'
import { HtmlElement } from '../primitives/index.ts'
import { DrawingTarget, anchors } from '../positioning/index.ts'

import { TargetBoundsDrawing } from './TargetBoundsDrawing.tsx'

let jitterMeasurement = 0

beforeEach(() => {
	jitterMeasurement = 0
	vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		if (this.style.position === 'relative') return rectangle(0, 0, Number.parseFloat(this.style.width), Number.parseFloat(this.style.height))
		if (this.dataset.testid === 'first-box' || this.dataset.testid === 'second-box') return rectangle(Number.parseFloat(this.style.left), Number.parseFloat(this.style.top), 100, 20)
		if (this.dataset.testid === 'jitter-target') return rectangle(Number.parseFloat(this.style.left), Number.parseFloat(this.style.top), 50 + (++jitterMeasurement % 2 === 0 ? 0.001 : 0), 20)
		if (this.dataset.testid === 'target') {
			const drawing = this.closest('div[style*="position: relative"]') as HTMLElement
			return Number.parseFloat(drawing.style.width) === 800 ? rectangle(100, 100, 50, 20) : rectangle(10, 10, 50, 20)
		}
		return rectangle(0, 0, 200, 100)
	})
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('TargetBoundsDrawing', () => {
	test('encompasses its targets with the requested margin', () => {
		const ref = createRef<DrawingHandle>()

		render(<TargetBoundsDrawing margin={10} ref={ref} targets={['target']}>
			<DrawingTarget data-testid="target" target="target">Target</DrawingTarget>
		</TargetBoundsDrawing>)

		expect(ref.current?.width).toBe(70)
		expect(ref.current?.height).toBe(40)
	})

	test('encompasses multiple independently positioned HTML targets', () => {
		const ref = createRef<DrawingHandle>()

		render(<TargetBoundsDrawing margin={20} ref={ref} targets={['first-box', 'second-box']}>
			<HtmlElement anchor={anchors.topLeft} data-testid="first-box" position={[0, 0]} target="first-box">First</HtmlElement>
			<HtmlElement anchor={anchors.topLeft} data-testid="second-box" position={[0, 50]} target="second-box">Second</HtmlElement>
		</TargetBoundsDrawing>)

		expect(ref.current?.width).toBe(140)
		expect(ref.current?.height).toBe(110)
	})

	test('encompasses an HTML target positioned relative to another target', () => {
		const ref = createRef<DrawingHandle>()

		render(<TargetBoundsDrawing margin={20} ref={ref} targets={['first-box', 'second-box']}>
			<HtmlElement anchor={anchors.topLeft} data-testid="first-box" position={[0, 0]} target="first-box">First</HtmlElement>
			<HtmlElement
				anchor={anchors.topLeft}
				data-testid="second-box"
				position={{ target: 'first-box', anchor: anchors.bottomLeft, pixelOffset: [0, 30] }}
				target="second-box"
			>
				Second
			</HtmlElement>
		</TargetBoundsDrawing>)

		expect(ref.current?.width).toBe(140)
		expect(ref.current?.height).toBe(110)
	})

	test('settles across subpixel measurement jitter', () => {
		const ref = createRef<DrawingHandle>()

		render(<TargetBoundsDrawing margin={20} ref={ref} targets={['jitter-target']}>
			<HtmlElement anchor={anchors.topLeft} data-testid="jitter-target" position={[0, 0]} target="jitter-target">Target</HtmlElement>
		</TargetBoundsDrawing>)

		expect(ref.current?.width).toBeCloseTo(90, 2)
		expect(ref.current?.height).toBe(60)
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
