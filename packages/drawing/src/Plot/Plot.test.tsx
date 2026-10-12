// @vitest-environment jsdom
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Plot, PlotFigure } from './Plot.tsx'
import { PlotArea } from './PlotArea.tsx'
import { usePlot } from './context.ts'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('Plot', () => {
	it('provides its resolved domain and a plot-area clip path', () => {
		render(<Plot axes={{ x: { includeZero: false }, y: { includeZero: false } }} bounds={{ min: [-1, -2], max: [3, 4] }} view={{ type: 'bounds', width: 400, height: 300 }}>
			<PlotFacts />
			<PlotArea data-testid="plot-area"><path /></PlotArea>
		</Plot>)

		expect(screen.getByTestId('plot-facts').textContent).toBe('-1,3;-2,4')
		const plotArea = screen.getByTestId('plot-area')
		expect(plotArea.getAttribute('clip-path')).toMatch(/^url\(#.+-plot-area\)$/)
		expect(document.querySelector('clipPath rect')).not.toBeNull()
	})

	it('can wrap a plot in a responsive figure', () => {
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200)

		render(<PlotFigure aria-label="Responsive plot" bounds={{ min: [0, 0], max: [1, 1] }} view={{ type: 'bounds', width: 400, height: 300 }} />)

		const figure = screen.getByLabelText('Responsive plot')
		expect((figure.firstElementChild!.firstElementChild as HTMLElement).style.transform).toBe('scale(0.5)')
	})
})

function PlotFacts() {
	const { axes } = usePlot()
	return <div data-testid="plot-facts">{axes.x.domain.join(',')};{axes.y.domain.join(',')}</div>
}
