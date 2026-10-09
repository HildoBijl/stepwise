// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { DrawingHandle } from '../Drawing/types.ts'
import { DrawingTarget } from '../positioning/index.ts'

import { TargetBoundsDrawing } from './TargetBoundsDrawing.tsx'

beforeEach(() => {
	vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		if (this.style.position === 'relative') return rectangle(0, 0, Number.parseFloat(this.style.width), Number.parseFloat(this.style.height))
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
