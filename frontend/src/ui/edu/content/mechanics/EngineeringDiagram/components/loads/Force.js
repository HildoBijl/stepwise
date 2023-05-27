import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { processOptions } from 'step-wise/util/objects'
import { Vector, ensureSpan } from 'step-wise/geometry'

import { useGraphicalObject } from 'ui/figures'
import { Group, Line } from 'ui/figures/Drawing/components/svgComponents'
import { defaultObject, useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import ArrowHead, { defaultArrowHead } from './ArrowHead'

const useStyles = makeStyles((theme) => ({
	force: {
		'& .forceLine': {
			fill: 'none',
		},
	},
}))

export const defaultForce = {
	...defaultObject,
	span: undefined,
	graphicalSpan: undefined,
	size: defaultArrowHead.size,
	color: defaultArrowHead.color,
	className: 'force',
}

// Force draws a force vector. It must have a span parameter (a Span object), can have a size and a color.
export const Force = forwardRef((props, ref) => {
	// Check input.
	let { span, graphicalSpan, size, color, className, style } = processOptions(props, defaultForce)
	const { vector, end } = ensureSpan(useGraphicalObject(span, graphicalSpan), 2)
	size = ensureNumber(size)
	color = ensureString(color)
	ref = useRefWithEventHandlers(props, ref)

	// Draw a horizontal force ending in (0, 0) and transform it to position it.
	const classes = useStyles()
	return <Group ref={ref} graphicalPosition={end} rotate={vector.argument} className={clsx(classes.force, className)} {...{ style }}>
		<Line graphicalPoints={[new Vector(-vector.magnitude, 0), new Vector(-size, 0)]} className="forceLine" style={{ stroke: color, strokeWidth: size }} />
		<ArrowHead size={size} style={{ fill: color }} />
	</Group>
})
Force.defaultProps = defaultForce
export default Force
