// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { Figure } from './Figure.tsx'

let layoutWidth: number
let screenScale: number
let resizeCallback: ResizeObserverCallback

beforeEach(() => {
	layoutWidth = 400
	screenScale = 1
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => layoutWidth)
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width: layoutWidth * screenScale } as DOMRect))
	vi.stubGlobal('ResizeObserver', class ResizeObserverMock {
		constructor(callback: ResizeObserverCallback) {
			resizeCallback = callback
		}
		observe() {}
		disconnect() {}
		unobserve() {}
	})
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('Figure', () => {
	test('uniformly scales fixed-size contents to the displayed width', () => {
		render(<Figure width={800} height={500} maxWidth={600}><span>Contents</span></Figure>)

		const contents = screen.getByText('Contents').parentElement!
		expect(contents.style.width).toBe('800px')
		expect(contents.style.height).toBe('500px')
		expect(contents.style.transform).toBe('scale(0.5)')
		expect(contents.style.visibility).toBe('visible')
		expect(contents.parentElement!.style.aspectRatio).toBe('800 / 500')
		expect(contents.parentElement!.parentElement!.style.maxWidth).toBe('600px')
	})

	test('forwards div properties and its outer-element ref', () => {
		layoutWidth = 200
		let figure: HTMLDivElement | null = null

		render(<Figure ref={element => { figure = element }} width={200} height={100} alignment="right" aria-label="Diagram" />)

		expect(screen.getByLabelText('Diagram')).toBe(figure)
		expect(figure!.style.margin).toBe('0px 0px 0px auto')
	})

	test('can grow beyond its internal width when no display maximum is requested', () => {
		layoutWidth = 600

		render(<Figure width={300} height={200} maxWidth="none"><span>Growing contents</span></Figure>)

		const contents = screen.getByText('Growing contents').parentElement!
		expect(contents.style.transform).toBe('scale(2)')
		expect(contents.parentElement!.parentElement!.style.maxWidth).toBe('none')
	})

	test('keeps contents hidden until a measurable width is available', () => {
		layoutWidth = 0

		const { container } = render(<Figure width={200} height={100}>Contents</Figure>)

		const contents = container.firstElementChild!.firstElementChild!.firstElementChild as HTMLElement
		expect(contents.style.visibility).toBe('hidden')
	})

	test.each([0.5, 1, 2])('ignores an ancestor screen scale of %s when calculating its responsive scale', ancestorScale => {
		screenScale = ancestorScale
		render(<Figure width={800} height={500}><span>Scaled ancestor contents</span></Figure>)

		expect(screen.getByText('Scaled ancestor contents').parentElement!.style.transform).toBe('scale(0.5)')
	})

	test('responds to layout resizing but not ancestor zoom changes after mounting', () => {
		const { rerender } = render(<Figure width={800} height={500}><span>Responsive contents</span></Figure>)
		const contents = screen.getByText('Responsive contents').parentElement!
		expect(contents.style.transform).toBe('scale(0.5)')

		screenScale = 2
		rerender(<Figure width={800} height={500}><span>Responsive contents</span></Figure>)
		expect(contents.style.transform).toBe('scale(0.5)')

		layoutWidth = 600
		act(() => resizeCallback([{} as ResizeObserverEntry], {} as ResizeObserver))
		expect(contents.style.transform).toBe('scale(0.75)')
	})

	test('rejects invalid dimensions and alignment', () => {
		expect(() => render(<Figure width={0} height={100} />)).toThrow('zero')
		expect(() => render(<Figure width={100} height={100} alignment={'middle' as 'center'} />)).toThrow('Invalid Figure alignment')
	})
})
