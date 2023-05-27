import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'

import { Arc } from 'ui/components/figures/Drawing/components/svgTemp'
import { useRefWithEventHandlers } from 'ui/components/figures/Drawing/components/svgTemp/util'

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
