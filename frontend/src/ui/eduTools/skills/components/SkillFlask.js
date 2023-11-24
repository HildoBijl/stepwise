import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import Tooltip from '@material-ui/core/Tooltip'

import { processOptions, numberArray, boundTo, repeat, gridInterpolate } from 'step-wise/util'
import { getEV, getMaxLikelihood } from 'step-wise/skillTracking'
import { skillTree } from 'step-wise/eduTools'

import { mix, shift, toCSS } from 'util/colors'
import { useUniqueNumber } from 'util/react'
import { Translation, Check } from 'i18n'

import { defaultSkillThresholds } from '../recommendation'

// Define general settings.
const vb = 100 // Viewbox size.

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
	skillFlask: {
		filter: ({ strongShadow }) => strongShadow ? 'drop-shadow(-2px 6px 6px rgba(0, 0, 0, 1))' : 'drop-shadow(-1px 4px 3px rgba(0, 0, 0, 0.7))',
		height: ({ size }) => `${size}px`,
		transform: 'translateY(-1px)', // Compensation for the drop shadow. This makes it feel more balanced.
		width: ({ size }) => `${size}px`,

		'& .targetLine': {
			opacity: 0,
			stroke: ({ color }) => toCSS(shift(color, -0.4)),
			strokeWidth: 2,
			transition: `opacity ${theme.transitions.duration.standard}ms`,
		},
		'&:hover .targetLine': {
			opacity: 0.6,
		},
	},
	clip: ({ clipProperties }) => ({
		...clipProperties,
		transition: `y ${theme.transitions.duration.complex}ms, height ${theme.transitions.duration.complex}ms`,
	})
}))

export function SkillFlask(props) {
	const { coef, size = 60, strongShadow = false, className, skillId, isPriorKnowledge = false } = props
	const id = useUniqueNumber()

	// If a skillId is given, calculate and display the target.
	const thresholds = skillId ? processOptions(skillTree[skillId].thresholds || {}, defaultSkillThresholds) : undefined
	const target = thresholds && thresholds.pass * (isPriorKnowledge ? thresholds.pkFactor : 1)

	// Calculate style elements and pass them to the useStyles function.
	const part = getEV(coef)
	const fading = coefToFading(coef)
	const color = mix(partToColor(part), fadeColor, fading) // Dull the color in case of uncertainty.
	const classes = useStyles({
		clipProperties: {
			x: '0px',
			y: `${(1 - part) * (vb)}px`,
			width: `${vb}px`,
			height: `${part * (vb)}px`,
		},
		color,
		size,
		strongShadow,
	})

	// Render the component.
	return (
		<Tooltip title={<Translation entry="skills.prediction" path="eduTools/main"><span>We estimate a chance of <strong>{{ percentage: Math.round(part * 100) }}%</strong> that you will successfully complete an exercise in this skill.<Check value={!!thresholds}><Check.True> (Goal: {{ goal: Math.round(target * 100) }}%)</Check.True></Check></span></Translation>} arrow>
			<svg className={clsx(classes.skillFlask, 'skillFlask', className)} viewBox={`0 0 ${vb} ${vb}`}>
				<defs>
					<radialGradient id={`flaskBackground${id}`} cx="50%" cy="50%" r="70%" fx="64%" fy="26%">
						<stop offset="0%" style={{ stopColor: toCSS(shift(color, 1)) }} />
						<stop offset="100%" style={{ stopColor: toCSS(shift(color, 0.4)) }} />
					</radialGradient>
					<radialGradient id={`flaskForeground${id}`} cx="50%" cy="50%" r="70%" fx="64%" fy="26%">
						<stop offset="0%" style={{ stopColor: toCSS(shift(color, 0.4 + 0.5 * fading)) }} />
						<stop offset="100%" style={{ stopColor: toCSS(shift(color, -0.8 + 1.0 * fading)) }} />
					</radialGradient>
					<clipPath id={`flaskFill${id}`}>
						<rect className={classes.clip} />
					</clipPath>
				</defs>
				<circle cx={vb / 2} cy={vb / 2} r={vb / 2 - vb / 100} strokeWidth="0" fill={`url(#flaskBackground${id})`} />{/* Subtract a small amount to prevent the background from creeping around the edges. */}
				<circle cx={vb / 2} cy={vb / 2} r={vb / 2} strokeWidth="0" fill={`url(#flaskForeground${id})`} clipPath={`url(#flaskFill${id})`} />
				{thresholds ? <line x1={(1 / 2 - Math.sqrt(target - target ** 2)) * vb} y1={(1 - target) * vb} x2={(1 / 2 + Math.sqrt(target - target ** 2)) * vb} y2={(1 - target) * vb} className="targetLine" /> : null}
			</svg>
		</Tooltip>
	)
}

function partToColor(part) {
	const partTransitionList = numberArray(0, colorSpread.length - 1).map(v => v / (colorSpread.length - 1)) // An array of where (at what part) we transition from one color to the next; for instance [0, 0.2, 0.4, 0.6, 0.8, 1] or so.
	return repeat(4, index => gridInterpolate(part, colorSpread.map(color => color[index]), partTransitionList)) // Interpolate for each element in the color array.
}

function coefToFading(coef) {
	return boundTo((getMaxLikelihood(coef, 10).f - colorFadingEnd) / (colorFadingStart - colorFadingEnd), 0, 1) // Based on the maximum, how much should we fade colors to grey? If the maximum is low, we want more fading.
}
