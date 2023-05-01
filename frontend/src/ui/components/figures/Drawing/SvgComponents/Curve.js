import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureBoolean, ensureObject, processOptions } from 'step-wise/util/objects'
import { ensureVectorArray } from 'step-wise/geometry'

import { useTransformedOrGraphicalValue, useScaledOrGraphicalValue } from '../DrawingContext'

import { useRefWithEventHandlers, filterEventHandlers, getCurvePathThrough, getCurvePathAlong } from './util'
import { defaultLine } from './Line'

export const defaultCurve = {
	...defaultLine,
	className: 'curve',
	through: true,
	spread: undefined,
	graphicalSpread: undefined,
	part: 1,
}

// Curve draws a smooth curve along/through a set of points. Parameters include the curve part (0 means straight, 1 means maximally curved) or the spread of the curve (similar to curve radius). With the "through" parameter it can be determined whether the curve should go through the points or only along them.
export const Curve = forwardRef((props, ref) => {
	// Process the input.
	let { points, graphicalPoints, spread, graphicalSpread, part, through, close, className, style } = processOptions(props, defaultCurve)
	points = ensureVectorArray(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
	spread = useScaledOrGraphicalValue(spread, graphicalSpread)
	part = ensureNumber(part)
	through = ensureBoolean(through)
	close = ensureBoolean(close)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const path = (through ? getCurvePathThrough : getCurvePathAlong)(points, close, part, spread)
	return <path ref={ref} className={className} style={style} d={path} {...filterEventHandlers(props)} />
})
export default Curve
