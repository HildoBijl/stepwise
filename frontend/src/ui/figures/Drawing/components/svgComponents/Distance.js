import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureString } from 'step-wise/util/strings'
import { processOptions, filterOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureSpan } from 'step-wise/geometry'

import { useGraphicalObject, useGraphicalVector } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers } from './util'
import Line, { defaultLine } from './Line'

const useStyles = makeStyles((theme) => ({
	distance: {
		fill: 'none',
		stroke: 'black',
		'stroke-width': 1,
		'marker-start': 'url(#distanceArrowHead)',
		'marker-end': 'url(#distanceArrowHead)',
	},
}))

export const defaultDistance = {
	...defaultObject,
	span: undefined,
	graphicalSpan: undefined,
	shift: undefined,
	graphicalShift: Vector.zero,
	className: 'distance',
}

// Distance renders a distance spread. The given distance object must have a "span" parameter, which is a Span object: an object with a start, vector and/or end (two out of the three). It assumes the arrow heads will be added through the distance class and the SVG style definitions.
export const Distance = forwardRef((props, ref) => {
	// Process the input.
	let { span, graphicalSpan, shift, graphicalShift, className } = processOptions(props, defaultDistance)
	span = ensureSpan(useGraphicalObject(span, graphicalSpan), 2)
	shift = ensureVector(useGraphicalVector(shift, graphicalShift, true), 2)
	className = ensureString(className)
	ref = useRefWithEventHandlers(props, ref)

	// Render the line with the appropriate style. Enforce that the default className is used, because this adds the arrow spread.
	span = span.add(shift)
	const classes = useStyles()
	return <Line ref={ref} {...filterOptions(props, defaultLine)} graphicalPoints={[span.start, span.end]} className={clsx(classes.distance, className)} />
})
Distance.defaultProps = defaultDistance
export default Distance
