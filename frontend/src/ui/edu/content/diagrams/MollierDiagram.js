import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react'

import { firstOf, lastOf } from 'step-wise/util/arrays'
import { getRange } from 'step-wise/util/numbers'
import { maximumHumidity } from 'step-wise/data/moistureProperties'
import { tableInterpolate } from 'step-wise/util/interpolation'

import { Plot } from 'ui/components/figures'

// Set up the lines for the diagram.
const temperatureRange = maximumHumidity.headers[0]
const xOptions = getRange(0.1, 1, 10)
const lines = xOptions.map(x => ({
	points: temperatureRange.map(T => ({
		output: T.number,
		input: tableInterpolate(T, maximumHumidity).number * x,
	})),
}))
lastOf(lines).style = { 'stroke-width': 2 }

function MollierDiagram({ maxWidth }, ref) {
	const plotRef = useRef()
	useImperativeHandle(ref, () => plotRef.current) // Forward the plot ref.

	// Upon loading of the plot, draw the axes and lines.
	useEffect(() => {
		// Set up the plot range and labels.
		const plot = plotRef.current
		plot.range = {
			input: { min: 0, max: 35 },
			output: { min: firstOf(temperatureRange).number, max: lastOf(temperatureRange).number }
		}
		plot.addLabels('Absolute luchtvochtigheid [g/kg]', 'Temperatuur [°C]')

		// Draw all lines.
		lines.forEach(line => plot.drawLine(line))

		// Add the percentage markers.
		xOptions.forEach((x, index) => {
			let xPos = plot.scale.input(lastOf(lines[index].points).input) + 14
			let yPos = 0
			if (index === xOptions.length - 1) {
				xPos = plot.drawing.width + 18
				yPos = 10
			}
			plot.svg.append('text')
				.attr('text-anchor', 'middle')
				.attr('x', xPos)
				.attr('y', yPos)
				.text(`${Math.round(x * 100)}%`)
		})
	}, [plotRef])

	return <Plot ref={plotRef} maxWidth={maxWidth} width="600" height="450" />
}
export default forwardRef(MollierDiagram)