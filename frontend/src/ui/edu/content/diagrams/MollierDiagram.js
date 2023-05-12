import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react'

import { firstOf, lastOf } from 'step-wise/util/arrays'
import { getRange } from 'step-wise/util/numbers'
import { maximumHumidity } from 'step-wise/data/moistureProperties'
import { tableInterpolate } from 'step-wise/util/interpolation'

import { useIdentityTransformationSettings } from 'ui/components/figures'
import { Plot } from 'ui/components/figures/PlotOldToDoRemove'

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

export const MollierDiagram = forwardRef(({ maxWidth }, ref) => {
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
		plot.drawAxes()
		plot.addLabels('Absolute luchtvochtigheid [g/kg]', 'Temperatuur [°C]')
		plot.useHoverLines = true

		// Draw all lines.
		lines.forEach(line => plot.drawLine(line))

		// Add the percentage markers.
		xOptions.forEach((x, index) => {
			const text = `${Math.round(x * 100)}%`
			if (index === xOptions.length - 1) {
				plot.drawing.placeText(text, {
					x: plot.drawing.width + 18,
					y: 10,
				})
			} else {
				plot.drawing.placeText(text, {
					x: plot.scale.input(lastOf(lines[index].points).input) + 14,
					y: 0,
				})
			}
		})
	}, [plotRef])

	const transformationSettings = useIdentityTransformationSettings(600, 450, [])

	return <Plot ref={plotRef} transformationSettings={transformationSettings} maxWidth={maxWidth} />
})
export default MollierDiagram
