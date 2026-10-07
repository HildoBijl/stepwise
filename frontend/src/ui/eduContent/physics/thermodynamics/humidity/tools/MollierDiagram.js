import React, { forwardRef } from 'react'
import { useTheme } from '@mui/material'

import { rangeByStep, last } from '@step-wise/js-utils'
import { interpolateTable, interpolateTableInput } from '@step-wise/interpolation'
import { Quantity } from '@step-wise/physics-core'
import { maximumHumidityByTemperature } from '@step-wise/physics-data'
import { Axes, Crosshair, Curve, Grid, Label, Plot } from '@step-wise/drawing'

const factors = rangeByStep(0.1, 1, 0.1)
const pointsList = factors.map(factor => maximumHumidityByTemperature.inputAxes[0].map((temperature, index) => [maximumHumidityByTemperature.outputGrids[0][index].number * factor, temperature.number]))
const finalPoint = [35, interpolateTableInput(new Quantity('35 g/kg'), maximumHumidityByTemperature).number]
pointsList[pointsList.length - 1] = [...pointsList[pointsList.length - 1].filter(point => point[0] <= 35), finalPoint]

const pointToRelativeHumidity = ([x, y]) => {
	const T = new Quantity({ value: y, unit: 'dC' })
	const AH = new Quantity({ value: x, unit: 'g/kg' })
	const AHmax = interpolateTable(T, maximumHumidityByTemperature)
	if (!AHmax) return undefined // On undefined (out of range) do not show a label.
	const RH = AH.divide(AHmax).setUnit('')
	return (RH.number < 0 || RH.number > 1) ? undefined : `${Math.round(RH.number * 100)}%`
}

export const MollierDiagram = forwardRef(({ children, maxWidth = 400, ...drawingProps }, ref) => {
	const theme = useTheme()
	return <Plot {...drawingProps} ref={ref} axes={{ x: { ticks: { desiredCount: 9 } }, y: { ticks: { desiredCount: 8 } } }} bounds={{ min: [0, -10], max: [35, 35] }} maxWidth={maxWidth} view={{ type: 'fit', maxHeight: 300, maxWidth, margin: [[20, 20], [4, 12]] }}>
		<Grid />
		<Axes
			x={{ label: 'Absolute luchtvochtigheid [g/kg]', labelProps: { scale: 0.75 }, tickLabelProps: { scale: 0.65 } }}
			y={{ label: 'Temperatuur [°C]', labelProps: { scale: 0.75 }, tickLabelProps: { scale: 0.65 } }}
		/>

		{/* Mollier percentage lines. */}
		{pointsList.map((points, index) => <Curve key={index} positions={points} smoothing={{ mode: 'through' }} strokeWidth={index === pointsList.length - 1 ? 2 : 1} />)}
		{factors.map((factor, index) => <Label key={index} position={index === pointsList.length - 1 ? finalPoint : last(pointsList[index])} angle={index === pointsList.length - 1 ? Math.PI / 12 : Math.PI / 3} scale={0.65} distance={{ pixelDistance: index === pointsList.length - 1 ? 3 : 1 }}>{`${Math.round(factor * 100)}%`}</Label>)}

		{/* Hover crosshairs. */}
		<Crosshair formatXValue={value => value.toFixed(1)} formatYValue={value => value.toFixed(1)} getPointLabel={pointToRelativeHumidity} labelProps={{ scale: 0.75, style: { background: theme.palette.primary.main, borderRadius: 8, color: theme.palette.primary.contrastText, fontWeight: 'bold', padding: '1px 5px' } }} lineProps={{ stroke: theme.palette.primary.main }} markerProps={{ fill: theme.palette.primary.main }} />

		{children}
	</Plot>
})
