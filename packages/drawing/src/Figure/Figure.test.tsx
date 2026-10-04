// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { Figure } from './Figure.tsx'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('Figure', () => {
	test('uniformly scales fixed-size contents to the displayed width', () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
			return { width: this.hasAttribute('data-figure-viewport') ? 400 : 0 } as DOMRect
		})

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
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 200 } as DOMRect)
		let figure: HTMLDivElement | null = null

		render(<Figure ref={element => { figure = element }} width={200} height={100} alignment="right" aria-label="Diagram" />)

		expect(screen.getByLabelText('Diagram')).toBe(figure)
		expect(figure!.style.margin).toBe('0px 0px 0px auto')
	})

	test('keeps contents hidden until a measurable width is available', () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 0 } as DOMRect)

		const { container } = render(<Figure width={200} height={100}>Contents</Figure>)

		expect((container.querySelector('[data-figure-content]') as HTMLElement).style.visibility).toBe('hidden')
	})

	test('rejects invalid dimensions and alignment', () => {
		expect(() => render(<Figure width={0} height={100} />)).toThrow('zero')
		expect(() => render(<Figure width={100} height={100} alignment={'middle' as 'center'} />)).toThrow('Invalid Figure alignment')
	})
})
