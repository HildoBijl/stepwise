import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { processOptions } from 'step-wise/util/objects'
import { Vector } from 'step-wise/geometry/Vector'

import { Group, Line } from 'ui/components/figures/Drawing/drawingComponents/SvgComponents'
import { defaultObject, useRefWithEventHandlers } from 'ui/components/figures/Drawing/drawingComponents/SvgComponents/util'

import { Hinge } from '../structuralComponents'

export const defaultGround = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	thickness: Hinge.defaultProps.thickness,
	color: Hinge.defaultProps.color,
	rectangleOpacity: 0.4,
	width: 50,
	height: 12,
	className: 'ground',
}

export const Ground = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, thickness, color, rectangleOpacity, width, height, className, style } = processOptions(props, defaultGround)
	thickness = ensureNumber(thickness)
	color = ensureString(color)
	rectangleOpacity = ensureNumber(rectangleOpacity)
	width = ensureNumber(width)
	height = ensureNumber(height)
	ref = useRefWithEventHandlers(props, ref)

	return <Group {...{ ref, position, graphicalPosition, className, style }}>
		<rect className="groundRectangle" x={-width / 2} y={0} width={width} height={height} style={{ fill: color, opacity: rectangleOpacity }} />
		<Line className="groundLine" graphicalPoints={[new Vector(-width / 2, 0), new Vector(width / 2, 0)]} style={{ stroke: color, strokeWidth: thickness }} />
	</Group >
})
Ground.defaultProps = defaultGround
export default Ground
