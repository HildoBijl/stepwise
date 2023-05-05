import React, { forwardRef } from 'react'

import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry'

import { useGraphicalVector, useGraphicalDistance } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers } from './util'

export const defaultSquare = {
	...defaultObject,
	center: undefined,
	graphicalCenter: Vector.zero,
	side: undefined,
	graphicalSide: 0,
}

export const Square = forwardRef((props, ref) => {
	// Process the input.
	let { center, graphicalCenter, side, graphicalSide, className, style } = processOptions(props, defaultSquare)
	center = ensureVector(useGraphicalVector(center, graphicalCenter), 2)
	side = useGraphicalDistance(side, graphicalSide)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the square.
	return <rect ref={ref} x={center.x - side / 2} y={center.y - side / 2} width={side} height={side} className={className} style={style} {...filterEventHandlers(props)} />
})
Square.defaultProps = defaultSquare
export default Square
