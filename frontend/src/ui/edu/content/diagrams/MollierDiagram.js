import React, { forwardRef } from 'react'

import { spread, lastOf } from 'step-wise/util/arrays'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
import { maximumHumidity } from 'step-wise/data/moistureProperties'
import { tableInterpolate, inverseTableInterpolate } from 'step-wise/util/interpolation'

import { Drawing, usePlotTransformationSettings, Axes, MouseLines, Curve, Label, defaultAxesOptions } from 'ui/figures'

const factors = spread(0.1, 1, 0.1)
const pointsList = factors.map(factor => maximumHumidity.headers[0].map((temperature, index) => [maximumHumidity.grid[index].number * factor, temperature.number]))
const finalPoint = [35, inverseTableInterpolate(new FloatUnit('35 g/kg'), maximumHumidity).number]
pointsList[pointsList.length - 1] = [...pointsList[pointsList.length - 1].filter(point => point[0] <= 35), finalPoint]

const pointToRelativeHumidity = point => {
	const T = new FloatUnit({ float: point.y, unit: 'dC' })
	const AH = new FloatUnit({ float: point.x, unit: 'g/kg' })
	const AHmax = tableInterpolate(T, maximumHumidity)
	if (!AHmax)
		return null // On undefined (out of range) do not show a label.
	const RH = AH.divide(AHmax).setUnit('')
	return (RH.number < 0 || RH.number > 1) ? null : `${Math.round(RH.number * 100)}%`
}

export const MollierDiagram = forwardRef(({ children, ...options }, ref) => {
	const transformationSettings = usePlotTransformationSettings([[0, -10], [35, 35]], { maxHeight: 300, maxWidth: 400, extendBoundsToTicks: true, margin: [20, 4], ...options })
	return <Drawing ref={ref} transformationSettings={transformationSettings}>
		<Axes xLabel="Absolute luchtvochtigheid [g/kg]" yLabel="Temperatuur [°C]" />
		<MouseLines pointToLabel={pointToRelativeHumidity} />
		{pointsList.map((points, index) => <Curve key={index} points={points} style={index === pointsList.length - 1 ? { strokeWidth: 2 } : {}} />)}
		{factors.map((factor, index) => <Label key={index} position={index === pointsList.length - 1 ? finalPoint : lastOf(pointsList[index])} angle={index === pointsList.length - 1 ? -Math.PI / 12 : -Math.PI / 3} scale={defaultAxesOptions.textScale} graphicalDistance={index === pointsList.length - 1 ? 3 : 1}>{`${Math.round(factor * 100)}%`}</Label>)}
		{children}
	</Drawing>
})
export default MollierDiagram
