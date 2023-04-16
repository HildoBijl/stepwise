import React, { forwardRef } from 'react'

import { ensureInt, ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { numberArray } from 'step-wise/util/arrays'
import { Vector, ensureVector } from 'step-wise/geometry/Vector'

import { drawingComponents, useTransformedOrGraphicalValue } from 'ui/components/figures'

import { defaultBeam, Hinge, defaultHinge, HalfHinge } from './structuralComponents'

const { defaultObject, useRefWithEventHandlers, Group, Line } = drawingComponents

/*
 * Part 1 of this file contains all the actual structural supports.
 */

// The defaultSupport is unherited by each of the default support objects.
export const defaultSupport = {
	...defaultObject,
	position: Vector.zero,
	graphicalPosition: Vector.zero,
	angle: Math.PI / 2,
	color: defaultBeam.color,
	thickness: defaultHinge.thickness,
	groundOptions: {},
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
export const defaultFixedSupport = {
	...defaultSupport,
	width: 36,
	height: 6,
	positionFactor: 1 / 6, // The position factor determines how much above the middle of the rectangle the incoming beam is positioned, as a part of the full rectangle height.
	className: 'support fixedSupport',
}

export const AdjacentFixedSupport = forwardRef((props, ref) => {
	return <FixedSupport ref={ref} {...props} positionFactor={1} />
})

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
export const defaultHingeSupport = {
	...defaultSupport,
	width: 32,
	height: 20,
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
export const defaultHalfHingeSupport = {
	...defaultHingeSupport,
	shift: defaultBeam.thickness / 2,
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
export const defaultRollerSupport = {
	...defaultFixedSupport,
	numWheels: 4,
	wheelRadius: 4,
	wheelsOptions: {},
}

export const AdjacentRollerSupport = forwardRef((props, ref) => {
	return <RollerSupport ref={ref} {...props} positionFactor={1} />
})

export const RollerHingeSupport = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, angle, color, thickness, groundOptions, width, height, numWheels, wheelRadius, wheelsOptions, className, style } = processOptions(props, defaultRollerHingeSupport)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelsOptions = ensureObject(wheelsOptions)
	ref = useRefWithEventHandlers(props, ref)

	// Make a group and position it appropriately.
	return <Group ref={ref} rotate={angle - Math.PI / 2} {...{ position, graphicalPosition, className, style }}>
		<SupportTriangle {...{ color, width, height }} />
		<Ground graphicalPosition={new Vector(0, height + 2 * wheelRadius + thickness)} {...{ color, thickness, ...groundOptions }} />
		<Wheels graphicalPosition={new Vector(0, height + wheelRadius + thickness / 2)} {...{ color, numWheels, wheelRadius, ...wheelsOptions }} />
		<Hinge {...{ color, thickness }} />
	</Group>
})
export const defaultRollerHingeSupport = {
	...defaultHingeSupport,
	numWheels: defaultRollerSupport.numWheels,
	wheelRadius: defaultRollerSupport.wheelRadius,
	wheelsOptions: {},
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
export const defaultRollerHalfHingeSupport = {
	...defaultRollerHingeSupport,
	shift: defaultHalfHingeSupport.shift,
}


/*
 * Part 2 of this file contains parts needed to draw the structural supports, like the Ground, Wheels and such.
 */

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
export const defaultGround = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	thickness: defaultHinge.thickness,
	color: defaultHinge.color,
	rectangleOpacity: 0.4,
	width: 50,
	height: 12,
	className: 'ground',
}

export const SupportBlock = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, color, width, height, className, style } = processOptions(props, defaultSupportBlock)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition), 2)
	color = ensureString(color)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the support block.
	return <rect ref={ref} x={position.x - width / 2} y={position.y - height / 2} width={width} height={height} className={className} style={{ fill: color, ...style }} />
})
export const defaultSupportBlock = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	color: defaultBeam.color,
	width: defaultFixedSupport.width,
	height: defaultFixedSupport.height,
	className: 'supportBlock',
}

export const SupportTriangle = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, color, thickness, width, height, className, style } = processOptions(props, defaultSupportTriangle)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition), 2)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the support triangle.
	return <polygon ref={ref} points={`${position.x} ${position.y}, ${position.x - width / 2} ${position.y + height}, ${position.x + width / 2} ${position.y + height}`} className={className} style={{ stroke: color, strokeWidth: thickness, ...style }} />
})
export const defaultSupportTriangle = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	color: defaultHinge.color,
	thickness: defaultHinge.thickness,
	width: 32,
	height: 20,
	className: 'supportTriangle',
}

export const Wheels = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, color, numWheels, wheelRadius, wheelStyle, className, style } = processOptions(props, defaultWheels)
	color = ensureString(color)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelStyle = ensureObject(wheelStyle)
	ref = useRefWithEventHandlers(props, ref)

	// Draw a group with the right number of wheels (circles).
	return <Group {...{ ref, position, graphicalPosition, className, style }}>
		{numberArray(0, numWheels - 1).map(index => <circle
			key={index}
			cx={(2 * index + 1 - numWheels) * wheelRadius}
			cy="0"
			r={wheelRadius}
			className="wheel"
			style={{ fill: color, ...wheelStyle }}
		/>)}
	</Group>
})
export const defaultWheels = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	color: defaultHinge.color,
	numWheels: defaultRollerSupport.numWheels,
	wheelRadius: defaultRollerSupport.wheelRadius,
	wheelStyle: {},
	className: 'wheels',
}