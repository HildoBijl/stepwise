import React from 'react'

import { maximumHumidity } from '@step-wise/physics-data'

import { Drawing, usePlotTransformationSettings, Axes, MouseLines, Curve, Group } from 'ui/figures'

const points = maximumHumidity.inputValues[0].map((temperature, index) => [temperature.number, maximumHumidity.grids[0][index].number])
export function MaximumHumidityPlot() {
	const transformationSettings = usePlotTransformationSettings([[-10, 0], [35, 35]], { maxHeight: 300, maxWidth: 400, margin: [0, [0, 20]] })
	return <Drawing transformationSettings={transformationSettings}>
		<Axes xLabel="Temperatuur [°C]" yLabel="Maximale luchtvochtigheid [g/kg]" />
		<MouseLines />
		<Group overflow={false}>
			<Curve points={points} style={{ strokeWidth: 2 }} />
		</Group>
	</Drawing>
}
