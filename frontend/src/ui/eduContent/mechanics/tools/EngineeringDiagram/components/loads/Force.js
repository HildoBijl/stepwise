import React, { forwardRef } from 'react'

import { ensureNumber, ensureString, mergeDefaults } from '@step-wise/utils'
import { Vector, ensureLineSegment } from '@step-wise/geometry'

import { useGraphicalObject } from 'ui/figures'
import { Group, Line } from 'ui/figures/Drawing/components/svgComponents'
import { defaultObject, useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import ArrowHead, { defaultArrowHead } from './ArrowHead'

export const defaultForce = {
	...defaultObject,
	force: undefined,
	graphicalForce: undefined,
	size: defaultArrowHead.size,
	color: defaultArrowHead.color,
	className: 'force',
}

// Force draws a force vector. It must have a force parameter (a LineSegment object), can have a size and a color.
export const Force = forwardRef((props, ref) => {
	// Check input.
	let { force, graphicalForce, size, color, className, style } = mergeDefaults(props, defaultForce)
	const { vector, end } = ensureLineSegment(useGraphicalObject(force, graphicalForce), 2)
	size = ensureNumber(size)
	color = ensureString(color)
	ref = useRefWithEventHandlers(props, ref)

	// Draw a horizontal force ending in (0, 0) and transform it to position it.
	return <Group ref={ref} graphicalPosition={end} rotate={vector.argument} className={className} {...{ style }}>
		<Line graphicalPoints={[new Vector(-vector.magnitude, 0), new Vector(-size, 0)]} className="forceLine" style={{ fill: 'none', stroke: color, strokeWidth: size }} />
		<ArrowHead size={size} style={{ fill: color }} />
	</Group>
})
Force.defaultProps = defaultForce
export default Force
