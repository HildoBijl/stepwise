import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { getEV } from 'step-wise/skillTracking'
import { sum, findOptimum, numberArray } from 'step-wise/util/arrays'
import { boundTo, getCounterNumber } from 'step-wise/util/numbers'
import { getFunction, getEntropy } from 'step-wise/skillTracking/evaluation'
import { mix, toCSS } from '../../../util/colors'
import theme from '../../theme'

// Define general settings.
const vb = 100 // Viewbox size.
const t = 3 // Thickness of the border in SVG coordinates.
const transitionTime = theme.transitions.duration.complex // Milliseconds.

const numPoints = 20 // Number of numerical points we use to calculate colors.
const colorFadingStart = 0.8 // From which PDF function maximum function value do we start fading colors?
const colorFadingEnd = 3.5 // And when do we end?

const colorSpread = [ // Which colors do we display in the flask?
	// [0.58, 0.29, 0.02, 1], // #944a05
	[0.55, 0.05, 0.05, 1], // #8b0e0e
	[0.55, 0.05, 0.05, 1], // #8b0e0e
	[0.60, 0.30, 0.00, 1], // #994d00
	[0.55, 0.55, 0.05, 1], // #4a9405
	[0.05, 0.55, 0.05, 1], // #0e8b0e
	[0.04, 0.44, 0.24, 1], // #0a6f3c
	[0.02, 0.27, 0.54, 1], // #044488
]

// Calculate point colors, for each of the numerical points.
const pointColors = numberArray(0, numPoints).map(i => {
	// Find the color of the color bar at this point.
	const colorSpreadIndex = i / numPoints * (colorSpread.length - 1)
	const colorA = colorSpread[Math.floor(colorSpreadIndex)]
	const colorB = colorSpread[Math.ceil(colorSpreadIndex)]
	const regularPointColor = mix(colorA, colorB, colorSpreadIndex - Math.floor(colorSpreadIndex))
	return regularPointColor
})

const useStyles = makeStyles((theme) => ({
	circle: {
		fill: ({ color }) => color,
		transition: `fill ${transitionTime}ms`,
	},
	clip: ({ clipProperties }) => ({
		...clipProperties,
		transition: `y ${transitionTime}ms, height ${transitionTime}ms`,
	})
}))

export default function Flask(props) {
	const { coef, size = 60 } = props

	const part = getEV(coef)
	const { color, fading } = coefToColor(coef)
	color[3]*= (1 - fading)
	const classes = useStyles({
		color: toCSS(color),
		clipProperties: {
			x: 0,
			y: t + (1 - part) * (vb - 2 * t),
			width: vb,
			height: part * (vb - 2 * t),
		},
	})
	
	const id = getCounterNumber()
	return (
		<svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
			<defs>
				<clipPath id={`flaskFill${id}`}>
					<rect className={classes.clip} />
				</clipPath>
			</defs>
			<circle cx={vb / 2} cy={vb / 2} r={vb / 2 - t / 2} strokeWidth="0" className={classes.circle} clipPath={`url(#flaskFill${id})`} />
			<circle cx={vb / 2} cy={vb / 2} r={vb / 2 - t / 2} stroke={theme.palette.text.primary} strokeWidth={t} fill="none" />
		</svg>
	)
}

function coefToColor(coef) {
	// Calculate some initial parameters.
	const f = getFunction(coef) // Get the probability density function.
	const values = numberArray(0, numPoints).map(p => p / numPoints).map(f) // Calculate values at defined intervals.
	const max = findOptimum(values, (a, b) => a > b) // Find the maximum value.
	const colorFading = boundTo((max - colorFadingEnd) / (colorFadingStart - colorFadingEnd), 0, 1) // Based on the maximum, how much should we damp colors? If the maximum is low, we want more damping.

	// Find the "expected/mean color value".
	const valuesSum = sum(values)
	const integratedColor = numberArray(0, 3).map(i => pointColors.reduce((sum, color, j) => sum + color[i]*values[j], 0)/valuesSum)

	// Return results.
	return {
		color: integratedColor,
		fading: colorFading,
	}
}
