import React, { forwardRef } from 'react'

import { ensureString, ensureObject, mergeDefaults } from '@step-wise/js-utils'
import { Vector, ensureVector } from '@step-wise/geometry'
import { useEventListenersRef } from '@step-wise/react-utils'

import { useGraphicalVector, useGraphicalDistance, SvgPortal } from '../../DrawingContext'

import { defaultObject, filterEventHandlers } from './util'

export const defaultSquare = {
	...defaultObject,
	center: undefined,
	graphicalCenter: Vector.zero,
	side: undefined,
	graphicalSide: 0,
}

export const Square = forwardRef((props, ref) => {
	// Process the input.
	let { center, graphicalCenter, side, graphicalSide, className, style } = mergeDefaults(props, defaultSquare)
	center = ensureVector(useGraphicalVector(center, graphicalCenter), { dimension: 2 })
	side = useGraphicalDistance(side, graphicalSide)
	className = ensureString(className)
	style = { ...defaultSquare.style, ...ensureObject(style) }
	ref = useEventListenersRef(filterEventHandlers(props), ref)

	// Set up the square.
	return <SvgPortal>
		<rect ref={ref} x={center.x - side / 2} y={center.y - side / 2} width={side} height={side} className={className} style={style} />
	</SvgPortal>
})
Square.defaultProps = defaultSquare
export default Square
