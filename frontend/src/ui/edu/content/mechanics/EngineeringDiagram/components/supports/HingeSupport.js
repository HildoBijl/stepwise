import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector } from 'step-wise/geometry/Vector'

import { Group } from 'ui/components/figures/Drawing/SvgComponents'
import { useRefWithEventHandlers } from 'ui/components/figures/Drawing/SvgComponents/util'

import { Hinge } from '../structuralComponents'
import { Ground, SupportTriangle } from '../attachments'

import { defaultSupport } from './util'

export const defaultHingeSupport = {
	...defaultSupport,
	width: SupportTriangle.defaultProps.width,
	height: SupportTriangle.defaultProps.height,
}

export const HingeSupport = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, angle, color, thickness, groundOptions, width, height, className, style } = processOptions(props, defaultHingeSupport)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	ref = useRefWithEventHandlers(props, ref)

	// Make a group and position it appropriately.
	return <Group ref={ref} rotate={angle - Math.PI / 2} {...{ position, graphicalPosition, className, style }}>
		<SupportTriangle {...{ color, thickness, width, height }} />
		<Ground graphicalPosition={new Vector(0, height)} {...{ color, thickness, ...groundOptions }} />
		<Hinge {...{ color, thickness }} />
	</Group>
})
HingeSupport.defaultProps = defaultHingeSupport
export default HingeSupport
