import React, { forwardRef } from 'react'

import { ensureInt, ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector } from 'step-wise/geometry/Vector'

import { Group } from 'ui/components/figures/Drawing/components/svgComponents'
import { useRefWithEventHandlers } from 'ui/components/figures/Drawing/components/svgComponents/util'

import { HalfHinge } from '../structuralComponents'
import { Ground, SupportTriangle, Wheels } from '../attachments'

import { defaultHalfHingeSupport } from './HalfHingeSupport'
import { defaultRollerHingeSupport } from './RollerHingeSupport'

export const defaultRollerHalfHingeSupport = {
	...defaultRollerHingeSupport,
	shift: defaultHalfHingeSupport.shift,
}

export const RollerHalfHingeSupport = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, angle, color, thickness, groundOptions, width, height, numWheels, wheelRadius, wheelsOptions, shift, className, style } = processOptions(props, defaultRollerHalfHingeSupport)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelsOptions = ensureObject(wheelsOptions)
	shift = ensureNumber(shift)
	ref = useRefWithEventHandlers(props, ref)

	// Make a group and position it appropriately.
	return <Group ref={ref} rotate={angle - Math.PI / 2} {...{ position, graphicalPosition, className, style }}>
		<SupportTriangle {...{ color, width, height, graphicalPosition: new Vector(0, shift) }} />
		<Ground graphicalPosition={new Vector(0, shift + height + 2 * wheelRadius + thickness)} {...{ color, thickness, ...groundOptions }} />
		<Wheels graphicalPosition={new Vector(0, shift + height + wheelRadius + thickness / 2)} {...{ color, numWheels, wheelRadius, ...wheelsOptions }} />
		<HalfHinge {...{ color, thickness, graphicalPosition: new Vector(0, shift) }} />
	</Group>
})
RollerHalfHingeSupport.defaultProps = defaultRollerHalfHingeSupport
export default RollerHalfHingeSupport
