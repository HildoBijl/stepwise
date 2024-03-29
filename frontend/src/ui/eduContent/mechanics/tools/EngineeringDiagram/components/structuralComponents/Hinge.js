import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber, ensureString, ensureObject, processOptions } from 'step-wise/util'
import { Vector } from 'step-wise/geometry'

import { Circle } from 'ui/figures/Drawing/components/svgComponents'
import { defaultObject, useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import { defaultBeam } from './Beam'

const useStyles = makeStyles((theme) => ({
	hinge: {
		fill: 'white',
	},
}))

export const defaultHinge = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	radius: undefined,
	graphicalRadius: 6,
	thickness: 2,
	color: defaultBeam.color,
	className: 'hinge',
}

export const Hinge = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, radius, graphicalRadius, thickness, color, className, style } = processOptions(props, defaultHinge)
	thickness = ensureNumber(thickness)
	color = ensureString(color)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	const classes = useStyles()
	return <Circle
		center={position}
		graphicalCenter={graphicalPosition}
		className={clsx(classes.hinge, className)}
		style={{ stroke: color, strokeWidth: thickness, ...style }}
		{...{ ref, radius, graphicalRadius }}
	/>
})
Hinge.defaultProps = defaultHinge
export default Hinge
