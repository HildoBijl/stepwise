// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { Drawing } from './Drawing.tsx'
import { useDrawingCoordinateSystem } from './context.ts'
import { HtmlPortal, SvgDefsPortal, SvgPortal } from './portals.tsx'
import type { DrawingHandle } from './types.ts'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('Drawing', () => {
	test('sets up synchronized Canvas, SVG, and HTML layers', () => {
		mockElementWidths()

		const { container } = render(<Drawing view={{ type: 'identity', width: 300, height: 200 }} useCanvas />)

		const canvas = container.querySelector('canvas')!
		const svg = container.querySelector('svg')!
		const html = [...canvas.parentElement!.children].find(element => element.tagName === 'DIV') as HTMLDivElement
		expect(canvas.width).toBe(300)
		expect(canvas.height).toBe(200)
		expect(svg.getAttribute('viewBox')).toBe('0 0 300 200')
		expect(canvas.style.zIndex).toBe('0')
		expect(svg.style.zIndex).toBe('1')
		expect(html.style.zIndex).toBe('2')
		expect(svg.style.pointerEvents).toBe('none')
		expect(html.style.pointerEvents).toBe('none')
	})

	test('renders portal contents into their corresponding layers', () => {
		mockElementWidths()

		const { container } = render(<Drawing view={{ type: 'identity', width: 300, height: 200 }}>
			<SvgPortal><g data-testid="svg-contents"><SvgPortal><circle /></SvgPortal></g></SvgPortal>
			<SvgDefsPortal><linearGradient data-testid="svg-definition" /></SvgDefsPortal>
			<HtmlPortal><button style={{ pointerEvents: 'auto' }}>HTML contents</button></HtmlPortal>
		</Drawing>)

		expect(screen.getByTestId('svg-contents').parentElement).toBe(container.querySelector('svg'))
		expect(screen.getByTestId('svg-contents').querySelector('circle')).not.toBeNull()
		expect(screen.getByTestId('svg-definition').parentElement?.tagName).toBe('defs')
		expect(screen.getByText('HTML contents').parentElement?.parentElement).toBe(container.querySelector('svg')?.parentElement)
	})

	test('provides its coordinate system through context and its imperative handle', () => {
		mockElementWidths()
		const ref = createRef<DrawingHandle>()

		render(<Drawing ref={ref} view={{ type: 'identity', width: 200, height: 100 }}>
			<CoordinateReader />
		</Drawing>)
		vi.spyOn(ref.current!.element!, 'getBoundingClientRect').mockReturnValue({ left: 10, top: 20, width: 400, height: 200 } as DOMRect)

		expect(screen.getByText('200 × 100')).toBeTruthy()
		expect(ref.current!.width).toBe(200)
		expect(ref.current!.height).toBe(100)
		expect(ref.current!.svg).toBeInstanceOf(SVGSVGElement)
		expect(ref.current!.canvas).toBeNull()
		expect(ref.current!.drawingToClient([50, 25])!.coordinates).toEqual([110, 70])
		expect(ref.current!.clientToDrawing([110, 70])!.coordinates).toEqual([50, 25])
	})

	test('allows the SVG layer to be omitted', () => {
		mockElementWidths()

		const { container } = render(<Drawing view={{ type: 'identity', width: 300, height: 200 }} useSvg={false} />)

		expect(container.querySelector('svg')).toBeNull()
		expect(container.querySelector('canvas')).toBeNull()
	})

	test('clips every drawing layer to the drawing bounds when requested', () => {
		mockElementWidths()

		const { container } = render(<Drawing clip view={{ type: 'identity', width: 300, height: 200 }} useCanvas />)
		const drawingElement = container.querySelector('canvas')!.parentElement!
		const clipRectangle = container.querySelector('clipPath rect')!

		expect(drawingElement.style.overflow).toBe('hidden')
		expect(clipRectangle.getAttribute('width')).toBe('300')
		expect(clipRectangle.getAttribute('height')).toBe('200')
	})
})

function CoordinateReader() {
	const { width, height } = useDrawingCoordinateSystem()
	return <HtmlPortal>{width} × {height}</HtmlPortal>
}

function mockElementWidths() {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect)
}
