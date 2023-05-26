import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureString } from 'step-wise/util/strings'
import { ensureBoolean, ensureObject, processOptions } from 'step-wise/util/objects'
import { ensureVectorArray } from 'step-wise/geometry'

import { useGraphicalVector, SvgPortal } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers, getLinePath } from './util'

const useStyles = makeStyles((theme) => ({
	line: {
		fill: 'none',
		stroke: 'black',
		'stroke-width': 1,
	},
}))

export const defaultLine = {
	...defaultObject,
	className: 'line',
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
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the line.
	const classes = useStyles()
	const path = getLinePath(points, close)
	return <SvgPortal><path ref={ref} className={clsx(classes.line, className)} style={style} d={path} {...filterEventHandlers(props)} /></SvgPortal>
})
Line.defaultProps = defaultLine
export default Line
