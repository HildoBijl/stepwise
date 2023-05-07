import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector } from 'step-wise/geometry/Vector'

import { Group } from 'ui/components/figures/Drawing/SvgComponents'
import { useRefWithEventHandlers } from 'ui/components/figures/Drawing/SvgComponents/util'

import { Beam, HalfHinge } from '../structuralComponents'
import { Ground, SupportTriangle } from '../attachments'

import { defaultHingeSupport } from './HingeSupport'

export const defaultHalfHingeSupport = {
	...defaultHingeSupport,
	shift: Beam.defaultProps.thickness / 2,
}

export const HalfHingeSupport = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, angle, color, thickness, groundOptions, width, height, shift, className, style } = processOptions(props, defaultHalfHingeSupport)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	shift = ensureNumber(shift)
	ref = useRefWithEventHandlers(props, ref)

	// Make a group and position it appropriately.
	return <Group ref={ref} rotate={angle - Math.PI / 2} {...{ position, graphicalPosition, className, style }}>
		<SupportTriangle {...{ color, thickness, width, height, graphicalPosition: new Vector(0, shift) }} />
		<Ground graphicalPosition={new Vector(0, shift + height)} {...{ color, thickness, ...groundOptions }} />
		<HalfHinge {...{ color, thickness, graphicalPosition: new Vector(0, shift) }} />
	</Group>
})
HalfHingeSupport.defaultProps = defaultHalfHingeSupport
export default HalfHingeSupport
