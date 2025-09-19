import React, { forwardRef } from 'react'

import { ensureNumber, ensureString, ensureObject, processOptions } from 'step-wise/util'
import { Vector, ensureVector } from 'step-wise/geometry/Vector'

import { useGraphicalVector } from 'ui/figures'
import { defaultObject, useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import { Beam } from '../structuralComponents'

export const defaultSupportBlock = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	color: Beam.defaultProps.color,
	width: 36,
	height: 6,
	className: 'supportBlock',
}

export const SupportBlock = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, color, width, height, className, style } = processOptions(props, defaultSupportBlock)
	position = ensureVector(useGraphicalVector(position, graphicalPosition), 2)
	color = ensureString(color)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the support block.
	return <rect ref={ref} x={position.x - width / 2} y={position.y - height / 2} width={width} height={height} className={className} style={{ strokeWidth: 0, fill: color, ...style }} />
})
SupportBlock.defaultProps = defaultSupportBlock
export default SupportBlock
