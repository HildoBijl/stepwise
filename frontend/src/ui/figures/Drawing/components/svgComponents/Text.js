import React, { forwardRef } from 'react'

import { ensureString, ensureObject, processOptions } from 'step-wise/util'
import { ensureVector } from 'step-wise/geometry'

import { useGraphicalVector, SvgPortal } from '../../DrawingContext'

import { defaultObject, useRefWithEventHandlers, filterEventHandlers } from './util'

export const defaultText = {
	...defaultObject,
	className: 'text',
	point: undefined,
	graphicalPoint: undefined,
	anchor: 'middle', // Can be start, middle or end; see the text-anchor SVG parameter.
	children: undefined,
}

// Line draws a line from the given points array and an optional style object.
export const Text = forwardRef((props, ref) => {
	// Process the input.
	let { point, graphicalPoint, anchor, className, style, children } = processOptions(props, defaultText)
	point = ensureVector(useGraphicalVector(point, graphicalPoint), 2)
	anchor = ensureString(anchor)
	className = ensureString(className)
	style = { ...defaultText.style, ...ensureObject(style) }
	ref = useRefWithEventHandlers(props, ref)

	// Only accept a string as a child.
	if (typeof children !== 'string')
		throw new Error(`Invalid Text parameter: expected a string as input for the Text component, but received something of type "${typeof children}".`)

	// Set up the line.
	return <SvgPortal>
		<text ref={ref} textAnchor={anchor} className={className} style={style} x={point.x} y={point.y} {...filterEventHandlers(props)}>
			{children}
		</text>
	</SvgPortal>
})
Text.defaultProps = defaultText
export default Text
