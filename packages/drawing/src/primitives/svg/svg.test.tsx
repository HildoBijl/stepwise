// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { Drawing } from '../../Drawing/index.ts'

import { Arc } from './Arc.tsx'
import { BoundedLine } from './BoundedLine.tsx'
import { Circle } from './Circle.tsx'
import { Curve } from './Curve.tsx'
import { DistanceMarker } from './DistanceMarker.tsx'
import { Line } from './Line.tsx'
import { Polygon } from './Polygon.tsx'
import { Rectangle } from './Rectangle.tsx'
import { RightAngle } from './RightAngle.tsx'
import { Square } from './Square.tsx'
import { SvgGroup } from './SvgGroup.tsx'
import { SvgText } from './SvgText.tsx'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('SVG drawing primitives', () => {
	test('resolves lines and polygons into SVG paths', () => {
		const { container } = renderDrawing(<>
			<Line data-testid="line" positions={[[0, 0], [10, 20]]} stroke="red" strokeWidth={4} />
			<Polygon data-testid="polygon" fill="orange" positions={[[0, 0], [10, 0], [10, 10]]} stroke="blue" strokeWidth={3} />
		</>, 'up')
		expect(screen.getByTestId('line').getAttribute('d')).toBe('M0 100 L10 80')
		expect(screen.getByTestId('line').getAttribute('stroke')).toBe('red')
		expect(screen.getByTestId('line').getAttribute('stroke-width')).toBe('4')
		expect(screen.getByTestId('polygon').getAttribute('d')).toBe('M0 100 L10 100 L10 90 Z')
		expect(screen.getByTestId('polygon').getAttribute('fill')).toBe('orange')
		expect(screen.getByTestId('polygon').getAttribute('stroke')).toBe('blue')
		expect(screen.getByTestId('line').parentElement).toBe(container.querySelector('svg'))
	})

	test('renders circles, rectangles, and squares from resolved positions and distances', () => {
		renderDrawing(<>
			<Circle center={[20, 30]} data-testid="circle" radius={{ pixelDistance: 5 }} />
			<Rectangle cornerRadius={{ pixelDistance: 2 }} corners={[[10, 20], [40, 60]]} data-testid="rectangle" />
			<Square center={[50, 50]} data-testid="square" side={{ pixelDistance: 20 }} />
		</>)
		expect(screen.getByTestId('circle').getAttribute('cx')).toBe('20')
		expect(screen.getByTestId('circle').getAttribute('r')).toBe('5')
		expect(screen.getByTestId('rectangle').getAttribute('width')).toBe('30')
		expect(screen.getByTestId('rectangle').getAttribute('rx')).toBe('2')
		expect(screen.getByTestId('square').getAttribute('x')).toBe('40')
	})

	test('renders arcs and smooth curves', () => {
		renderDrawing(<>
			<Arc data-testid="arc" radius={{ pixelDistance: 10 }} />
			<Curve data-testid="curve" positions={[[0, 0], [10, 10], [20, 0]]} />
		</>)
		expect(screen.getByTestId('arc').getAttribute('d')).toBe('M10 0 A10 10 0 0 1 -10 1.2246467991473533e-15')
		expect(screen.getByTestId('curve').getAttribute('d')).toContain('C')
	})

	test('renders text and transformed groups', () => {
		renderDrawing(<SvgGroup data-testid="group" position={[10, 20]} rotate={Math.PI / 2} scale={2}>
			<SvgText data-testid="text" position={[5, 6]}>Text</SvgText>
		</SvgGroup>)
		expect(screen.getByTestId('group').getAttribute('transform')).toBe('translate(10 20) rotate(90) scale(2)')
		expect(screen.getByTestId('text').getAttribute('x')).toBe('5')
	})

	test('renders bounded lines and right-angle markers', () => {
		renderDrawing(<>
			<BoundedLine data-testid="bounded" through={[[-10, 50], [110, 50]]} />
			<RightAngle data-testid="right-angle" positions={[[20, 0], [0, 0], [0, 20]]} size={{ pixelDistance: 5 }} />
		</>)
		expect(screen.getByTestId('bounded').getAttribute('d')).toBe('M0 50 L100 50')
		expect(screen.getByTestId('right-angle').getAttribute('d')).toBe('M5 0 L5 5 L0 5')
	})

	test('renders a distance marker and its arrowhead definition', () => {
		const { container } = renderDrawing(<DistanceMarker data-testid="distance" positions={[[10, 10], [30, 10]]} />)
		expect(screen.getByTestId('distance').style.markerStart).toContain('distance-marker')
		expect(container.querySelector('defs marker')).not.toBeNull()
	})

	test('does not render until every required position resolves', () => {
		renderDrawing(<Line positions={[[0, 0], { target: 'missing' }]} />)
		expect(document.querySelector('svg path')).toBeNull()
	})
})

function renderDrawing(children: ReactNode, yDirection: 'up' | 'down' = 'down') {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect)
	return render(<Drawing view={{ type: 'identity', width: 100, height: 100, yDirection }}>{children}</Drawing>)
}
