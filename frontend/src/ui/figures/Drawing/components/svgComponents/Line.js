import React, { forwardRef } from 'react'

import { ensureString, ensureBoolean, ensureObject, processOptions } from 'step-wise/util'
import { ensureVectorArray } from 'step-wise/geometry'

import { useGraphicalVector, SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers, getLinePath } from './util'

export const defaultLine = {
	...defaultObject,
	className: 'line',
	style: {
		...defaultObject.style,
		fill: 'none',
		stroke: 'black',
		strokeWidth: 1,
	},
	points: undefined,
	graphicalPoints: undefined,
	close: false,
}

// Line draws a line from the given points array and an optional style object.
export const Line = forwardRef((props, ref) => {
	// Process the input.
	let { points, graphicalPoints, close, className, style } = processOptions(props, defaultLine)
	points = ensureVectorArray(useGraphicalVector(points, graphicalPoints), 2)
	close = ensureBoolean(close)
	className = ensureString(className)
	style = { ...defaultLine.style, ...ensureObject(style) }
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const path = getLinePath(points, close)
	return <SvgPortal>
		<path ref={ref} className={className} style={style} d={path} {...filterEventHandlers(props)} />
	</SvgPortal>
})
Line.defaultProps = defaultLine
export default Line
