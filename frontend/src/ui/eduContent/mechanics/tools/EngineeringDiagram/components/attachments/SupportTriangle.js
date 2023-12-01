import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber, ensureString, ensureObject, processOptions } from 'step-wise/util'
import { Vector, ensureVector } from 'step-wise/geometry/Vector'

import { useGraphicalVector } from 'ui/figures'
import { defaultObject, useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import { Hinge } from '../structuralComponents'

const useStyles = makeStyles((theme) => ({
	supportTriangle: {
		fill: 'white',
	},
}))

export const defaultSupportTriangle = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	color: Hinge.defaultProps.color,
	thickness: Hinge.defaultProps.thickness,
	width: 32,
	height: 20,
	className: 'supportTriangle',
}

export const SupportTriangle = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, color, thickness, width, height, className, style } = processOptions(props, defaultSupportTriangle)
	position = ensureVector(useGraphicalVector(position, graphicalPosition), 2)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the support triangle.
	const classes = useStyles()
	return <polygon ref={ref} points={`${position.x} ${position.y}, ${position.x - width / 2} ${position.y + height}, ${position.x + width / 2} ${position.y + height}`} className={clsx(classes.supportTriangle, className)} style={{ stroke: color, strokeWidth: thickness, ...style }} />
})
SupportTriangle.defaultProps = defaultSupportTriangle
export default SupportTriangle
