import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureBoolean, ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry'

import { useDrawingId, useGraphicalVector, SvgPortal } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers } from './util'

export const defaultGroup = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	rotate: 0,
	scale: 1,
	overflow: true,
	children: null,
}

// Group sets up a groups with a given position, rotation and scale. (In that order: it's first translated, then rotated and then scaled.)
export const Group = forwardRef((props, ref) => {
	// Process the input.
	let { position, graphicalPosition, rotate, scale, overflow, className, style, children } = processOptions(props, defaultGroup)
	position = ensureVector(useGraphicalVector(position, graphicalPosition), 2)
	rotate = ensureNumber(rotate)
	scale = ensureNumber(scale)
	overflow = ensureBoolean(overflow)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the group with the right transform property.
	const drawingId = useDrawingId()
	return <SvgPortal><g ref={ref} className={className} style={{
		...style,
		clipPath: overflow ? '' : `url(#noOverflow${drawingId})`,
		transform: `translate(${position.x}px, ${position.y}px) rotate(${rotate * 180 / Math.PI}deg) scale(${scale}) ${style.transform || ''}`,
	}}>{children}</g></SvgPortal>
})
Group.defaultProps = defaultGroup
export default Group
