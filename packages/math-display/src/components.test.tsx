// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { BM, BMList, BMPart, M, MathContent } from './index.ts'

afterEach(cleanup)

describe('mathematics components', () => {
	it('renders inline mathematics through KaTeX', () => {
		const { container } = render(<M>x^2</M>)
		expect(container.querySelector('.equation > .katex')).not.toBeNull()
		expect(container.querySelector('.katex-display')).toBeNull()
	})

	it('renders raw block mathematics in display mode', () => {
		const { container } = render(<MathContent displayMode={true}>x^2</MathContent>)
		expect(container.querySelector('.katex-display')).not.toBeNull()
	})

	it('renders block mathematics and lists inside horizontal scrollers', () => {
		const block = render(<BM>x</BM>)
		expect(block.container.querySelector('.horizontalScroller')).not.toBeNull()
		block.unmount()
		const list = render(<BMList><BMPart>x</BMPart><BMPart>y</BMPart></BMList>)
		expect(list.container.querySelectorAll('.katex-display')).toHaveLength(2)
	})

	it('retains translation metadata on authoring components', () => {
		expect([M.tag, M.translation]).toEqual(['inline-math', false])
		expect([BM.tag, BM.translation]).toEqual(['block-math', false])
		expect([BMList.tag, BMList.translation]).toEqual(['math-list', false])
		expect([BMPart.tag, BMPart.translation]).toEqual(['math-list-part', false])
	})
})
