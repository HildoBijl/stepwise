import React from 'react'
import { useTheme } from '@mui/material'

import { Axes, Crosshair, Curve, Grid, Plot, PlotArea } from '@step-wise/drawing'
import { maximumHumidityByTemperature } from '@step-wise/physics-data'

const points = maximumHumidityByTemperature.inputAxes[0].map((temperature, index) => [temperature.number, maximumHumidityByTemperature.outputGrids[0][index].number])
export function MaximumHumidityPlot() {
	const theme = useTheme()
	const crosshairLabelStyle = { background: theme.palette.primary.main, borderRadius: 8, color: theme.palette.primary.contrastText, fontWeight: 'bold', padding: '1px 5px' }
	return <Plot axes={{ x: { ticks: { desiredCount: 9 } }, y: { ticks: { desiredCount: 8 } } }} bounds={{ min: [-10, 0], max: [35, 35] }} view={{ type: 'fit', maxHeight: 300, maxWidth: 400, margin: [0, [25, 5]] }}>
		<Grid />
		<Axes x={{ label: 'Temperatuur [°C]' }} y={{ label: 'Maximale luchtvochtigheid [g/kg]' }} />
		<Crosshair labelProps={{ scale: 0.75, style: crosshairLabelStyle }} lineProps={{ stroke: theme.palette.primary.main }} markerProps={{ fill: theme.palette.primary.main }} />
		<PlotArea>
			<Curve positions={points} smoothing={{ mode: 'through' }} strokeWidth={2} />
		</PlotArea>
	</Plot>
}
