import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { getEV, getFMax } from 'step-wise/skillTracking'
import { numberArray } from 'step-wise/util/arrays'
import { boundTo, interpolate } from 'step-wise/util/numbers'
import { mix, shift, toCSS } from '../../../util/colors'
import { useUniqueNumber } from '../../../util/react'
import theme from '../../theme'

// Define general settings.
const vb = 100 // Viewbox size.
const t = 1 // Thickness of the border in SVG coordinates.
const transitionTime = theme.transitions.duration.complex // Milliseconds.

// Define color-related settings.
const colorSpread = [ // Which colors do we display in the flask?
	[0.55, 0.05, 0.05, 1], // #8b0e0e
	[0.55, 0.05, 0.05, 1], // #8b0e0e
	[0.60, 0.30, 0.00, 1], // #994d00
	[0.55, 0.55, 0.05, 1], // #4a9405
	[0.05, 0.55, 0.05, 1], // #0e8b0e
	[0.02, 0.27, 0.54, 1], // #044488
]
const fadeColor = [0.4, 0.4, 0.4, 1] // To which color do we want to fade in case of uncertainty?
const colorFadingStart = 0.9 // From which PDF function maximum function value do we start fading colors?
const colorFadingEnd = 3 // And when do we end?

const useStyles = makeStyles((theme) => ({
	clip: ({ clipProperties }) => ({
		...clipProperties,
		transition: `y ${transitionTime}ms, height ${transitionTime}ms`,
	})
}))

export default function Flask(props) {
	const { coef, size = 60 } = props
	const id = useUniqueNumber()

	// Calculate style elements and pass them to the useStyles function.
	const part = getEV(coef)
	const fading = coefToFading(coef)
	const color = mix(partToColor(part), fadeColor, fading) // Dull the color in case of uncertainty.
	const classes = useStyles({
		color: toCSS(color),
		clipProperties: {
			x: '0px',
			y: `${t + (1 - part) * (vb - 2 * t)}px`,
			width: `${vb}px`,
			height: `${part * (vb - 2 * t)}px`,
		},
	})

	// Render the component.
	return (
		<svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
			<defs>
				<radialGradient id={`flaskBackground${id}`} cx="50%" cy="50%" r="80%" fx="70%" fy="30%">
					<stop offset="0%" style={{ stopColor: toCSS(shift(color, 1)) }} />
					<stop offset="100%" style={{ stopColor: toCSS(shift(color, 0.4)) }} />
				</radialGradient>
				<radialGradient id={`flaskForeground${id}`} cx="50%" cy="50%" r="80%" fx="70%" fy="30%">
					<stop offset="0%" style={{ stopColor: toCSS(shift(color, 0.4 + 0.5 * fading)) }} />
					<stop offset="100%" style={{ stopColor: toCSS(shift(color, -0.8 + 1.0 * fading)) }} />
				</radialGradient>
				<clipPath id={`flaskFill${id}`}>
					<rect className={classes.clip} />
				</clipPath>
			</defs>
			<circle cx={vb / 2} cy={vb / 2} r={vb / 2 - t / 2} strokeWidth="0" fill={`url(#flaskBackground${id})`} />
			<circle cx={vb / 2} cy={vb / 2} r={vb / 2 - t / 2} strokeWidth="0" fill={`url(#flaskForeground${id})`} clipPath={`url(#flaskFill${id})`} />
			<circle cx={vb / 2} cy={vb / 2} r={vb / 2 - t / 2} stroke={theme.palette.text.primary} strokeWidth={t} fill="none" />
		</svg>
	)
}

function partToColor(part) {
	return interpolate(
		numberArray(0, colorSpread.length - 1).map(v => v / (colorSpread.length - 1)), // For instance [0, 0.2, 0.4, 0.6, 0.8, 1] or so.
		colorSpread, // [c1, c2, ..., cn] with each ci a color array.
		part, // The part which the sphere is filled. It's used to interpolate the color.
	)
}

function coefToFading(coef) {
	return boundTo((getFMax(coef, 10).f - colorFadingEnd) / (colorFadingStart - colorFadingEnd), 0, 1) // Based on the maximum, how much should we fade colors to grey? If the maximum is low, we want more fading.
}
