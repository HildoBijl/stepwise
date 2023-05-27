import React, { forwardRef } from 'react'

import { ensureInt, ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector } from 'step-wise/geometry/Vector'

import { Group } from 'ui/components/figures/Drawing/drawingComponents/SvgComponents'
import { useRefWithEventHandlers } from 'ui/components/figures/Drawing/drawingComponents/SvgComponents/util'

import { Ground, SupportBlock, Wheels } from '../attachments'

import { defaultFixedSupport } from './FixedSupport'

export const defaultRollerSupport = {
	...defaultFixedSupport,
	numWheels: Wheels.defaultProps.numWheels,
	wheelRadius: Wheels.defaultProps.wheelRadius,
	wheelsOptions: {},
}

export const RollerSupport = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, angle, color, thickness, groundOptions, width, height, positionFactor, numWheels, wheelRadius, wheelsOptions, className, style } = processOptions(props, defaultRollerSupport)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	positionFactor = ensureNumber(positionFactor)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelsOptions = ensureObject(wheelsOptions)
	ref = useRefWithEventHandlers(props, ref)

	// Make a group and position it appropriately.
	return <Group ref={ref} rotate={angle - Math.PI / 2} {...{ position, graphicalPosition, className, style }}>
		<SupportBlock graphicalPosition={new Vector(0, height * positionFactor)} {...{ color, height, width }} />
		<Ground graphicalPosition={new Vector(0, height * (1 / 2 + positionFactor) + 2 * wheelRadius + thickness / 2)} {...{ color, thickness, ...groundOptions }} />
		<Wheels graphicalPosition={new Vector(0, height * (1 / 2 + positionFactor) + wheelRadius)} {...{ color, numWheels, wheelRadius, ...wheelsOptions }} />
	</Group>
})
RollerSupport.defaultProps = defaultRollerSupport
export default RollerSupport
