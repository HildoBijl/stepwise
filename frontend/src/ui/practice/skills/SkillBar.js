import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { numberArray, findOptimum } from 'step-wise/util/arrays'
import { boundTo } from 'step-wise/util/numbers'
import { getFunction } from 'step-wise/skillTracking/evaluation'
import { mix, darken, toCSS } from '../../../util/colors'

const numPoints = 20
const colorDampingStart = 0.8
const colorDampingEnd = 3
const dampedColor = [0.4, 0.4, 0.4, 1] // Dark grey.
const colorSpread = [
	[0.76, 0.46, 0.23, 1], // #c3763c
	[0.93, 0.08, 0.08, 1], // #ec1313
	[1, 0.5, 0, 1], // #ff8000
	[0.93, 0.93, 0.07, 1], // #ff8000
	[0.09, 0.91, 0.5, 1], // #16e980
	[0.03, 0.49, 0.97, 1], // #087cf7
]

const useStyles = makeStyles((theme) => ({
	skillBar: {
		background: ({ colorBar }) => `linear-gradient(to right, ${colorBar.map(toCSS).join(', ')})`,
		border: `1px solid ${theme.palette.text.primary}`,
		height: '10px',
		width: '100%',
	},
}))

export default function SkillBar({ coef, className }) {
	const classes = useStyles({ colorBar: coefToColorBar(coef) })

	return (
		<div className={clsx(classes.skillBar, 'skillBar', className)}>
		</div>
	)
}

function coefToColorBar(coef) {
	// Define some initial settings.
	const f = getFunction(coef) // Get the probability density function.
	const values = numberArray(0, numPoints).map(p => p / numPoints).map(f) // Calculate values at defined intervals.
	const max = findOptimum(values, (a, b) => a > b) // Find the maximum value.
	const colorDamping = boundTo((max - colorDampingEnd) / (colorDampingStart - colorDampingEnd), 0, 1) // Based on the maximum, how much should we damp colors? If the maximum is low, we want more damping.

	// Walk through each of the points to determine their color.
	return values.map((v, i) => {
		// Find the color of the color bar at this point.
		const colorSpreadIndex = i / numPoints * (colorSpread.length - 1)
		const colorA = colorSpread[Math.floor(colorSpreadIndex)]
		const colorB = colorSpread[Math.ceil(colorSpreadIndex)]
		const regularPointColor = mix(colorA, colorB, colorSpreadIndex - Math.floor(colorSpreadIndex))

		// Darken and dampen the color, based on the earlier derived settings.
		const darkenedPointColor = darken(regularPointColor, 1 - v / max)
		const dampedPointColor = mix(darkenedPointColor, dampedColor, colorDamping)
		return dampedPointColor
	})
}