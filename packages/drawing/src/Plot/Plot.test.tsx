// @vitest-environment jsdom
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Plot } from './Plot.tsx'
import { PlotArea } from './PlotArea.tsx'
import { usePlot } from './context.ts'

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
})

function PlotFacts() {
	const { axes } = usePlot()
	return <div data-testid="plot-facts">{axes.x.domain.join(',')};{axes.y.domain.join(',')}</div>
}
