import React, { forwardRef } from 'react'
import clsx from 'clsx'

import { ensureString } from 'step-wise/util/strings'
import { processOptions, filterOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, Span, ensureSpan } from 'step-wise/geometry'

import { useTransformedOrGraphicalValue } from '../DrawingContext'

import { defaultObject, useRefWithEventHandlers } from './util'
import Line, { defaultLine } from './Line'

export const defaultDistance = {
	...defaultObject,
	span: undefined,
	graphicalSpan: new Span({ start: Vector.zero, end: new Vector(100, 0) }),
	shift: undefined,
	graphicalShift: Vector.zero,
	className: 'distance',
}

// Distance renders a distance spread. The given distance object must have a "span" parameter, which is a Span object: an object with a start, vector and/or end (two out of the three). It assumes the arrow heads will be added through the distance class and the SVG style definitions.
export const Distance = forwardRef((props, ref) => {
	// Process the input.
	let { span, graphicalSpan, shift, graphicalShift, className } = processOptions(props, defaultDistance)
	span = ensureSpan(useTransformedOrGraphicalValue(span, graphicalSpan), 2)
	shift = ensureVector(useTransformedOrGraphicalValue(shift, graphicalShift, true), 2)
	className = ensureString(className)
	ref = useRefWithEventHandlers(props, ref)

	// Render the line with the appropriate style. Enforce that the default className is used, because this adds the arrow spread.
	span = span.add(shift)
	return <Line ref={ref} {...filterOptions(props, defaultLine)} graphicalPoints={[span.start, span.end]} className={clsx(className, className === defaultDistance.className ? '' : defaultDistance.className)} />
})
export default Distance
