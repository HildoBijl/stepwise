import React from 'react'

import { ensureInt, ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { numberArray } from 'step-wise/util/arrays'
import { Vector, ensureVector } from 'step-wise/CAS/linearAlgebra/Vector'

import { defaultObject, Group } from './groups'
import { Line } from './shapes'
import { defaultBeam, Hinge, defaultHinge } from './structuralComponents'

/*
 * Part 1 of this file contains all the actual structural supports.
 */

// The defaultSupport is unherited by each of the default support objects.
export const defaultSupport = {
	...defaultObject,
	position: Vector.zero,
	angle: Math.PI / 2,
	color: defaultBeam.color,
	thickness: defaultHinge.thickness,
	groundOptions: {},
}

export function FixedSupport(props) {
	// Check input.
	let { position, angle, color, thickness, groundOptions, width, height, positionFactor, className, style } = processOptions(props, defaultFixedSupport)
	position = ensureVector(position, 2)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	positionFactor = ensureNumber(positionFactor)
	className = ensureString(className)
	style = ensureObject(style)

	// Make a group and position it appropriately.
	return <Group rotate={angle - Math.PI / 2} {...{ position, className, style }}>
		<SupportBlock position={new Vector(0, height * positionFactor)} {...{ color, width, height }} />
		<Ground position={new Vector(0, height * (1 / 2 + positionFactor))} {...{ color, thickness, ...groundOptions }} />
	</Group>
}
export const defaultFixedSupport = {
	...defaultSupport,
	width: 36,
	height: 6,
	positionFactor: 1 / 6, // The position factor determines how much above the middle of the rectangle the incoming beam is positioned, as a part of the full rectangle height.
	className: 'support fixedSupport',
}

export function HingeSupport(props) {
	// Check input.
	let { position, angle, color, thickness, groundOptions, width, height, className, style } = processOptions(props, defaultHingeSupport)
	position = ensureVector(position, 2)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)

	// Make a group and position it appropriately.
	return <Group rotate={angle - Math.PI / 2} {...{ position, className, style }}>
		<SupportTriangle {...{ color, thickness, width, height }} />
		<Ground position={new Vector(0, height)} {...{ color, thickness, ...groundOptions }} />
		<Hinge {...{ color, thickness }} />
	</Group>
}
export const defaultHingeSupport = {
	...defaultSupport,
	width: 32,
	height: 20,
}

export function RollerSupport(props) {
	// Check input.
	let { position, angle, color, thickness, groundOptions, width, height, positionFactor, numWheels, wheelRadius, wheelsOptions, className, style } = processOptions(props, defaultRollerSupport)
	position = ensureVector(position, 2)
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
	className = ensureString(className)
	style = ensureObject(style)

	// Make a group and position it appropriately.
	return <Group rotate={angle - Math.PI / 2} {...{ position, className, style }}>
		<SupportBlock position={new Vector(0, height * positionFactor)} {...{ color, height, width }} />
		<Ground position={new Vector(0, height * (1 / 2 + positionFactor) + 2 * wheelRadius + thickness / 2)} {...{ color, thickness, ...groundOptions }} />
		<Wheels position={new Vector(0, height * (1 / 2 + positionFactor) + wheelRadius)} {...{ color, numWheels, wheelRadius, ...wheelsOptions }} />
	</Group>
}
export const defaultRollerSupport = {
	...defaultFixedSupport,
	numWheels: 4,
	wheelRadius: 4,
	wheelsOptions: {},
}

export function RollerHingeSupport(props) {
	// Check input.
	let { position, angle, color, thickness, groundOptions, width, height, numWheels, wheelRadius, wheelsOptions, className, style } = processOptions(props, defaultRollerHingeSupport)
	position = ensureVector(position, 2)
	angle = ensureNumber(angle)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	groundOptions = ensureObject(groundOptions)
	width = ensureNumber(width)
	height = ensureNumber(height)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelsOptions = ensureObject(wheelsOptions)
	className = ensureString(className)
	style = ensureObject(style)

	// Make a group and position it appropriately.
	return <Group rotate={angle - Math.PI / 2} {...{ position, className, style }}>
		<SupportTriangle {...{ color, width, height }} />
		<Ground position={new Vector(0, height + 2 * wheelRadius + thickness)} {...{ color, thickness, ...groundOptions }} />
		<Wheels position={new Vector(0, height + wheelRadius + thickness / 2)} {...{ color, numWheels, wheelRadius, ...wheelsOptions }} />
		<Hinge {...{ color, thickness }} />
	</Group>
}
export const defaultRollerHingeSupport = {
	...defaultHingeSupport,
	numWheels: defaultRollerSupport.numWheels,
	wheelRadius: defaultRollerSupport.wheelRadius,
	wheelsOptions: {},
}

/*
 * Part 2 of this file contains parts needed to draw the structural supports, like the Ground, Wheels and such.
 */

export function Ground(props) {
	// Check input.
	let { position, thickness, color, rectangleOpacity, width, height, className, style } = processOptions(props, defaultGround)
	position = ensureVector(position, 2)
	thickness = ensureNumber(thickness)
	color = ensureString(color)
	rectangleOpacity = ensureNumber(rectangleOpacity)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)

	return <Group {...{ position, className, style }}>
		<rect className="groundRectangle" x={-width / 2} y={0} width={width} height={height} style={{ fill: color, opacity: rectangleOpacity }} />
		<Line className="groundLine" points={[new Vector(-width / 2, 0), new Vector(width / 2, 0)]} style={{ stroke: color, strokeWidth: thickness }} />
	</Group >
}
export const defaultGround = {
	...defaultObject,
	position: Vector.zero,
	thickness: defaultHinge.thickness,
	color: defaultHinge.color,
	rectangleOpacity: 0.4,
	width: 50,
	height: 12,
	className: 'ground',
}

export function SupportBlock(props) {
	// Check input.
	let { position, color, width, height, className, style } = processOptions(props, defaultSupportBlock)
	position = ensureVector(position, 2)
	color = ensureString(color)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)

	// Draw the support block.
	return <rect x={position.x - width / 2} y={position.y - height / 2} width={width} height={height} className={className} style={{ fill: color, ...style }} />
}
export const defaultSupportBlock = {
	...defaultObject,
	position: Vector.zero,
	color: defaultBeam.color,
	width: defaultFixedSupport.width,
	height: defaultFixedSupport.height,
	className: 'supportBlock',
}

export function SupportTriangle(props) {
	// Check input.
	let { position, color, thickness, width, height, className, style } = processOptions(props, defaultSupportTriangle)
	position = ensureVector(position, 2)
	color = ensureString(color)
	thickness = ensureNumber(thickness)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)

	// Draw the support triangle.
	return <polygon points={`${position.x} ${position.y}, ${position.x - width / 2} ${position.y + height}, ${position.x + width / 2} ${position.y + height}`} className={className} style={{ stroke: color, strokeWidth: thickness, ...style }} />
}
export const defaultSupportTriangle = {
	...defaultObject,
	position: Vector.zero,
	color: defaultHinge.color,
	thickness: defaultHinge.thickness,
	width: 32,
	height: 20,
	className: 'supportTriangle',
}

export function Wheels(props) {
	// Check input.
	let { position, color, numWheels, wheelRadius, wheelStyle, className, style } = processOptions(props, defaultWheels)
	position = ensureVector(position, 2)
	color = ensureString(color)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelStyle = ensureObject(wheelStyle)
	className = ensureString(className)
	style = ensureObject(style)

	// Draw a group with the right number of wheels (circles).
	return <Group {...{ position, className, style }}>
		{numberArray(0, numWheels - 1).map(index => <circle
			key={index}
			cx={(2 * index + 1 - numWheels) * wheelRadius}
			cy="0"
			r={wheelRadius}
			className="wheel"
			style={{ fill: color, ...wheelStyle }}
		/>)}
	</Group>
}
export const defaultWheels = {
	...defaultObject,
	position: Vector.zero,
	color: defaultHinge.color,
	numWheels: defaultRollerSupport.numWheels,
	wheelRadius: defaultRollerSupport.wheelRadius,
	wheelStyle: {},
	className: 'wheels',
}