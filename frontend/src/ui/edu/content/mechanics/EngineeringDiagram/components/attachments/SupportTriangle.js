import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry/Vector'

import { useGraphicalVector } from 'ui/components/figures'
import { defaultObject, useRefWithEventHandlers } from 'ui/components/figures/Drawing/SvgComponents/util'

import { Hinge } from '../structuralComponents'

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
	return <polygon ref={ref} points={`${position.x} ${position.y}, ${position.x - width / 2} ${position.y + height}, ${position.x + width / 2} ${position.y + height}`} className={className} style={{ stroke: color, strokeWidth: thickness, ...style }} />
})
SupportTriangle.defaultProps = defaultSupportTriangle
export default SupportTriangle
