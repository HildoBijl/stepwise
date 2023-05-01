import React, { forwardRef } from 'react'

import { ensureString } from 'step-wise/util/strings'
import { ensureBoolean, ensureObject, processOptions } from 'step-wise/util/objects'
import { ensureVectorArray } from 'step-wise/geometry'

import { useTransformedOrGraphicalValue } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers, getLinePath } from './util'

export const defaultLine = {
	...defaultObject,
	className: 'line',
	points: undefined,
	graphicalPoints: [],
	close: false,
}

// Line draws a line from the given points array and an optional style object.
export const Line = forwardRef((props, ref) => {
	// Process the input.
	let { points, graphicalPoints, close, className, style } = processOptions(props, defaultLine)
	points = ensureVectorArray(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
	close = ensureBoolean(close)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const path = getLinePath(points, close)
	return <path ref={ref} className={className} style={style} d={path} {...filterEventHandlers(props)} />
})
export default Line
