import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber, ensureString, ensureObject, processOptions } from 'step-wise/util'

import { Arc } from 'ui/figures/Drawing/components/svgComponents'
import { useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import { defaultHinge } from './Hinge'

const useStyles = makeStyles((theme) => ({
	halfHinge: {
		fill: 'white',
	},
}))

export const defaultHalfHinge = {
	...defaultHinge,
	angle: Math.PI / 2,
}

export const HalfHinge = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, radius, graphicalRadius, thickness, color, angle, className, style } = processOptions(props, defaultHalfHinge)
	thickness = ensureNumber(thickness)
	color = ensureString(color)
	angle = ensureNumber(angle)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the arc.
	const startAngle = angle - Math.PI / 2
	const endAngle = angle + Math.PI / 2
	const classes = useStyles()
	return <Arc
		center={position}
		graphicalCenter={graphicalPosition}
		className={clsx(classes.halfHinge, className)}
		style={{ stroke: color, strokeWidth: thickness, ...style }}
		{...{ ref, radius, graphicalRadius, startAngle, endAngle }}
	/>
})
HalfHinge.defaultProps = defaultHalfHinge
export default HalfHinge
