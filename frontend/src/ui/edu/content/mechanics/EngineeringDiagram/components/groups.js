import React from 'react'

import { processOptions } from 'step-wise/util/objects'
import { Vector } from 'step-wise/CAS/linearAlgebra/Vector'

// These are the parameters inherited by all object types.
export const defaultObject = {
	type: undefined,
	className: '',
	style: {},
}

// PositionedGroup sets up a groups with a given position, rotation and scale. (In that order: it's first translated, then rotated and then scaled.)
export function PositionedGroup(props) {
	// Check input.
	const { position, rotate, scale, className, style, children } = processOptions(props, defaultPositionedGroup)

	// Set up the group with the right transform property.
	return <g className={className} style={{
		...style,
		transform: `translate(${position.x}px, ${position.y}px) rotate(${rotate * 180 / Math.PI}deg) scale(${scale}) ${style.transform || ''}`,
	}}>{children}</g>
}
const defaultPositionedGroup = {
	...defaultObject,
	position: Vector.zero2D,
	rotate: 0,
	scale: 1,
	className: '',
	style: {},
	children: null,
}