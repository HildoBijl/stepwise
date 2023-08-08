import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber, ensureString, ensureBoolean, ensureObject, processOptions } from 'step-wise/util'
import { ensureVectorArray } from 'step-wise/geometry'

import { useGraphicalVector, useGraphicalDistance, SvgPortal } from '../../DrawingContext'

import { useRefWithEventHandlers, filterEventHandlers, getCurvePathThrough, getCurvePathAlong } from './util'
import { defaultLine } from './Line'

const useStyles = makeStyles((theme) => ({
	curve: {
		fill: 'none',
		stroke: 'black',
		'stroke-width': 1,
	},
}))

export const defaultCurve = {
	...defaultLine,
	className: 'curve',
	through: true,
	part: 1,
	spread: undefined,
	graphicalSpread: undefined,
}

// Curve draws a smooth curve along/through a set of points. Parameters include the curve part (0 means straight, 1 means maximally curved) or the spread of the curve (similar to curve radius). With the "through" parameter it can be determined whether the curve should go through the points or only along them.
export const Curve = forwardRef((props, ref) => {
	// Process the input.
	let { points, graphicalPoints, spread, graphicalSpread, part, through, close, className, style } = processOptions(props, defaultCurve)
	points = ensureVectorArray(useGraphicalVector(points, graphicalPoints), 2)
	spread = useGraphicalDistance(spread, graphicalSpread)
	part = ensureNumber(part)
	through = ensureBoolean(through)
	close = ensureBoolean(close)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const classes = useStyles()
	const path = (through ? getCurvePathThrough : getCurvePathAlong)(points, close, part, spread)
	return <SvgPortal><path ref={ref} className={clsx(classes.curve, className)} style={style} d={path} {...filterEventHandlers(props)} /></SvgPortal>
})
Curve.defaultProps = defaultCurve
export default Curve
