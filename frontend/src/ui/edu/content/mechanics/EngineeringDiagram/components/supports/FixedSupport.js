import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector } from 'step-wise/geometry/Vector'

import { Group } from 'ui/components/figures/Drawing/drawingComponents/SvgComponents'
import { useRefWithEventHandlers } from 'ui/components/figures/Drawing/drawingComponents/SvgComponents/util'

import { Ground, SupportBlock } from '../attachments'

import { defaultSupport } from './util'

export const defaultFixedSupport = {
	...defaultSupport,
	width: SupportBlock.defaultProps.width,
	height: SupportBlock.defaultProps.height,
	positionFactor: 1 / 6, // The position factor determines how much above the middle of the rectangle the incoming beam is positioned, as a part of the full rectangle height.
	className: 'support fixedSupport',
}

export const FixedSupport = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, angle, color, thickness, groundOptions, width, height, positionFactor, className, style } = processOptions(props, defaultFixedSupport)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	positionFactor = ensureNumber(positionFactor)
	ref = useRefWithEventHandlers(props, ref)

	// Make a group and position it appropriately.
	return <Group ref={ref} rotate={angle - Math.PI / 2} {...{ position, graphicalPosition, className, style }}>
		<SupportBlock graphicalPosition={new Vector(0, height * positionFactor)} {...{ color, width, height }} />
		<Ground graphicalPosition={new Vector(0, height * (1 / 2 + positionFactor))} {...{ color, thickness, ...groundOptions }} />
	</Group>
})
FixedSupport.defaultProps = defaultFixedSupport
export default FixedSupport
