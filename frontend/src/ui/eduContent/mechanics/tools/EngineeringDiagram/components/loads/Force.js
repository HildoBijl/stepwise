import React, { forwardRef } from 'react'

import { ensureNumber, ensureString, mergeDefaults } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'

import { useGraphicalDistance } from 'ui/figures'
import { Group, Line } from 'ui/figures/Drawing/components/svgComponents'
import { defaultObject, useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import { defaultGraphicalForceLength } from '../../../support'

import ArrowHead, { defaultArrowHead } from './ArrowHead'

export const defaultForce = {
	...defaultObject,
	position: undefined,
	angle: undefined,
	applicationPointAt: 'end',
	relativeMagnitude: 1,
	magnitude: undefined,
	graphicalMagnitude: defaultGraphicalForceLength,
	force: undefined,
	graphicalForce: undefined,
	size: defaultArrowHead.size,
	color: defaultArrowHead.color,
	className: 'force',
}

// Force draws a force vector. It must have a force parameter (a LineSegment object), can have a size and a color.
export const Force = forwardRef((props, ref) => {
	// Check input.
	let { position, angle, applicationPointAt, relativeMagnitude, magnitude, graphicalMagnitude, size, color, className, style } = mergeDefaults(props, defaultForce)
	relativeMagnitude = ensureNumber(relativeMagnitude, { nonNegative: true, nonZero: true })
	magnitude = relativeMagnitude * ensureNumber(useGraphicalDistance(magnitude, graphicalMagnitude))
	const graphicalPosition = applicationPointAt === 'end' ? Vector.zero : Vector.fromPolar(magnitude, angle)
	size = ensureNumber(size)
	color = ensureString(color)
	ref = useRefWithEventHandlers(props, ref)

	// Draw a horizontal force ending in (0, 0) and transform it to position it.
	return <Group ref={ref} rotate={angle} className={className} {...{ position, graphicalPosition, style }}>
		<Line graphicalPoints={[new Vector(-magnitude, 0), new Vector(-size, 0)]} className="forceLine" style={{ fill: 'none', stroke: color, strokeWidth: size }} />
		<ArrowHead size={size} style={{ fill: color }} />
	</Group>
})
Force.defaultProps = defaultForce
export default Force
