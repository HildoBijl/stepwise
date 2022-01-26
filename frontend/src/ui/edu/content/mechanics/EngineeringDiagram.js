// Plot is the parent component of every plot made. It gives options to generate various kinds of plots.

import React, { Fragment, forwardRef } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { line } from 'd3-shape'

import { ensureInt, ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { isObject, ensureBoolean, ensureObject, processOptions, filterOptions } from 'step-wise/util/objects'
import { numberArray } from 'step-wise/util/arrays'
import { Vector, ensureVector, ensureSVE } from 'step-wise/CAS/linearAlgebra/Vector'

import Drawing, { defaultOptions as drawingDefaultOptions } from '../../../components/figures/Drawing'

const defaultOptions = {
	width: drawingDefaultOptions.width,
	height: drawingDefaultOptions.height,
	maxWidth: drawingDefaultOptions.maxWidth,
	parts: {},
}
export { defaultOptions }

const useStyles = makeStyles((theme) => ({
	engineeringDiagram: {
		'& svg': {
			'& .line, & .distance': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 1,
			},
			'& .distance': {
				'marker-start': 'url(#distanceArrowHead)',
				'marker-end': 'url(#distanceArrowHead)',
			},
			'& .forceLine': {
				fill: 'none',
			},
			'& .momentLine': {
				fill: 'none',
			},
			'& .arrowHead': {
				fill: 'black',
				'stroke-width': 0,
			},
			'& .beamLine': {
				fill: 'none',
			},
			'& .beamStrut': {
				'stroke-width': 0,
			},
			'& .hinge': {
				fill: 'white',
			},
			'& .supportTriangle': {
				fill: 'white',
			},
			'& .supportBlock': {
				'stroke-width': 0,
			},
			'& .wheel': {
				'stroke-width': 0,
			},
		},
	},
}))

export function EngineeringDiagram(options, ref) {
	options = processOptions(options, defaultOptions)
	const classes = useStyles()

	// Add SVG objects to the diagram, based on the provided parts.
	options.svgContents = options.parts && renderData(options.parts)
	options.svgDefs = <EngineeringDiagramDefs />

	// Render the drawing.
	options.className = clsx('engineeringDiagram', classes.engineeringDiagram, options.className)
	return <Drawing ref={ref} {...filterOptions(options, drawingDefaultOptions)} />
}
export default forwardRef(EngineeringDiagram)

function EngineeringDiagramDefs() {
	return <>
		<marker id="distanceArrowHead" key="distanceArrowHead" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto-start-reverse">
			<path d="M0 0 L12 6 L0 12" stroke="black" strokeWidth="1" fill="none" />
		</marker>,
		<marker id="forceArrowHead" key="forceArrowHead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto-start-reverse">
			<polygon points="8 4, 0 0, 2 4, 0 8" />
		</marker>
	</>
}

/*
 * Below are functions rendering data given to the Engineering Diagram. It turns an object with data into JSX SVG elements.
 */

// renderData takes a data object and distributes it over the various rendering functions.
export function renderData(data) {
	// For arrays make a group out of all individual elements.
	if (Array.isArray(data))
		return <g>{data.map((element, index) => <Fragment key={index}>{renderData(element)}</Fragment>)}</g>

	// Check the input.
	if (!isObject(data))
		throw new Error(`Invalid Engineering Diagram data: expected an object or array, but received an input of type "${typeof data}".`)
	if (React.isValidElement(data))
		return data // Already a React object.
	const Component = components[data.type]
	if (!Component)
		throw new Error(`Invalid Engineering Diagram data: received an object with type property "${data.type}". Could not render this.`)

	// Render the requested component.
	return <Component {...data} />
}

// These are all the components that we have.
export const components = {
	group: Group,

	line: Line,
	distance: Distance,
	arrowHead: ArrowHead,
	force: Force,
	moment: Moment,

	beam: Beam,
	hinge: Hinge,
	fixedSupport: FixedSupport,
	hingeSupport: HingeSupport,
	rollerSupport: RollerSupport,
	rollerHingeSupport: RollerHingeSupport,
}

// These are the parameters inherited by all object types.
export const defaultObject = {
	type: undefined,
	className: 'group',
	style: {},
}

// Group takes a group object and turns all parameters of the object (apart from its type "group" and a potential group style) into SVG children of this group. Note that this set-up is more powerful than using an array, because it allows the same object to be linked to the same React key to prevent references from shifting.
export function Group(props) {
	const keys = Object.keys(props).filter(key => !['type', 'style', 'className'].includes(key))
	return <g className={props.className} style={props.style}>{keys.map(key => <Fragment key={key}>{renderData[props[key]]}</Fragment>)}</g>
}

// PositionedGroup sets up a groups with a given position, rotation and scale. (In that order: it's first translated, then rotated and then scaled.)
export function PositionedGroup(props) {
	// Check input.
	const { position, rotate, scale, className, style, children } = processOptions(props, defaultPositionedGroup)

	// Set up the group with the right transform property.
	return <g className={className} style={{
		...style,
		transform: `translate(${position.x}px, ${position.y}px) rotate(${rotate * 180 / Math.PI}deg) scale(${scale}) ${style.transform || ''}`,
	}}>{children}</g>
}
const defaultPositionedGroup = {
	position: Vector.zero2D,
	rotate: 0,
	scale: 1,
	className: '',
	style: {},
	children: null,
}

/*
 * Below are rendering functions for shapes like lines and arrows.
 */

// Line draws a line from the given points array and an optional style object.
export function Line(props) {
	// Process the input.
	let { points, className, style } = processOptions(props, defaultLine)
	if (!Array.isArray(points))
		throw new Error(`Invalid line points: expected an array of points but received a parameter of type "${typeof points}".`)
	points = points.map(point => ensureVector(point, 2))
	className = ensureString(className)
	style = ensureObject(style)

	// Set up the line.
	return <path className={className} style={style} d={line()(points.map(point => [point.x, point.y]))} />
}
export const defaultLine = {
	...defaultObject,
	className: 'line',
	points: [],
}

// Arc draws an arc (part of a circle) from a given position (center) with a given radius, startAngle and endAngle. Angles are measured in radians with the rightmost point being zero, clockwise positive.
export function Arc(props) {
	// Check input.
	let { position, radius, startAngle, endAngle, className, style } = processOptions(props, defaultArc)
	position = ensureVector(position, 2)
	radius = ensureNumber(radius)
	startAngle = ensureNumber(startAngle)
	endAngle = ensureNumber(endAngle)
	className = ensureString(className)
	style = ensureObject(style)

	// Draw the arc.
	return <path className={className} style={style} d={getArcPath(position, radius, startAngle, endAngle)} />
}
export const defaultArc = {
	...defaultObject,
	position: Vector.zero2D,
	radius: 50,
	startAngle: 0,
	endAngle: Math.PI,
	className: 'arc',
}

// getArcPath takes a circle center (a Vector), a radius, a start angle and an end angle, and gives the SVG path string that makes this path. For angles, the right is taken as zero and clockwise is taken as positive.
export function getArcPath(center, radius, startAngle, endAngle) {
	// Determine arc start and end.
	const start = center.add(Vector.fromPolar(radius, startAngle))
	const end = center.add(Vector.fromPolar(radius, endAngle))

	// Determine the flags needed by SVG.
	const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? '0' : '1'
	const sweepFlag = endAngle < startAngle ? '0' : '1'

	// Set up the path.
	return `M${start.x} ${start.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
}

// Distance renders a distance spread. The given distance object must have a "points" parameter, which is an SVE object: an object with a start, vector and/or end (two out of the three).
export function Distance(props) {
	let { points, className } = processOptions(props, defaultDistance)
	points = ensureSVE(points)
	return <Line {...filterOptions(props, defaultLine)} points={[points.start, points.end]} className={clsx(className, 'distance')} />
}
const defaultDistance = {
	...defaultObject,
	points: null,
	className: 'distance',
}

// ArrowHead draws an arrowhead in the given container at the given position and with the given angle. It can also be sized up and styled further.
export function ArrowHead(props) {
	// Check input.
	let { position, angle, size, color, className, style } = processOptions(props, defaultArrowHead)
	position = ensureVector(position, 2)
	angle = ensureNumber(angle)
	size = ensureNumber(size)
	color = ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)

	// Draw the arrow head shape and position it.
	return <polygon
		points="0 0, -24 -12, -16 0, -24 12"
		className={className}
		style={{
			fill: color,
			transform: `translate(${position.x}px, ${position.y}px) rotate(${angle * 180 / Math.PI}deg) scale(${size / defaultArrowHead.size})`,
			stroke: 'red',
			...style,
		}}
	/>
}
const defaultArrowHead = {
	...defaultObject,
	position: Vector.zero2D,
	angle: 0,
	size: 4,
	color: 'black',
	className: 'arrowHead',
}

// Force draws a force vector. It must have a points parameter (an SVE object), can have a size and a color.
export function Force(props) {
	// Check input.
	let { points, size, color, className, style } = processOptions(props, defaultForce)
	const { vector, end } = ensureSVE(points)
	size = ensureNumber(size)
	color = ensureString(color)

	// Draw a horizontal force ending in (0, 0) and transform it to position it.
	return <PositionedGroup position={end} rotate={vector.argument} {...{ className, style }}>
		<Line points={[new Vector(-vector.magnitude, 0), new Vector(-size, 0)]} className="forceLine" style={{ stroke: color, strokeWidth: size }} />
		<ArrowHead size={size} style={{ fill: color }} />
	</PositionedGroup>
}
export const defaultForce = {
	...defaultObject,
	points: null,
	size: defaultArrowHead.size,
	color: defaultArrowHead.color,
	className: 'force',
}

// Moment draws a moment vector. The moment must have a position property (a Vector) and a clockwise property (boolean). The options (all optional) include the color, the size (thickness of the line), the radius, the opening (the angle where the opening is in the moment arrow, by default being 0 which means to the right) and the spread (how large the circle arc is). The properties can also contain an extra style parameter to be applied.
export function Moment(props) {
	// Check input.
	let { position, clockwise, size, color, radius, opening, spread, arrowHeadDelta, className, style } = processOptions(props, defaultMoment)
	position = ensureVector(position, 2)
	clockwise = ensureBoolean(clockwise)
	size = ensureNumber(size)
	color = ensureString(color)
	radius = ensureNumber(radius)
	opening = ensureNumber(opening)
	spread = ensureNumber(spread)
	arrowHeadDelta = ensureNumber(arrowHeadDelta)
	className = ensureString(className)
	style = ensureObject(style)

	// Calculate relevant parameters.
	const factor = (clockwise ? 1 : -1)
	const startAngle = factor * (2 * Math.PI - spread) / 2
	const endAngle = startAngle + factor * spread
	const endAngleShortened = endAngle - 2 * factor * size / radius // Shorten the line to prevent passing by the arrow head.

	// Draw a horizontal moment around (0, 0) and transform it to position it.
	return <PositionedGroup rotate={opening} {...{ position, className, style }}>
		<Arc radius={radius} startAngle={startAngle} endAngle={endAngleShortened} className="momentLine" style={{ stroke: color, strokeWidth: size }} />
		<ArrowHead
			position={Vector.fromPolar(radius, endAngle)}
			angle={endAngle + factor * (Math.PI / 2 - arrowHeadDelta * size / radius)}
			size={size}
			style={{ fill: color }}
		/>
	</PositionedGroup>
}
export const defaultMoment = {
	...defaultObject,
	position: null,
	clockwise: false,
	size: defaultForce.size,
	color: defaultForce.size,
	radius: 25,
	opening: 0, // The position of the opening in radians, measured clockwise from right.
	spread: 7 / 4 * Math.PI, // Which angle (part of the circle) is drawn?
	arrowHeadDelta: 2.5, // The angle of the arrow head is manually adjusted to make it look OK. This factor is responsible. Increase or decrease it at will.
	className: 'moment',
}

/*
 * Below are rendering methods for structural components.
 */

export function Beam(props) {
	// Check input.
	let { points, thickness, strutSize, strutOpacity, color, className, style } = processOptions(props, defaultBeam)
	thickness = ensureNumber(thickness)
	strutSize = ensureNumber(strutSize)
	strutOpacity = ensureNumber(strutOpacity)
	color = ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)

	// Render the struts.
	const struts = points.map((point, index) => {
		if (index === 0 || index === points.length - 1)
			return null
		const prev = points[index - 1].subtract(point).unitVector().multiply(strutSize).add(point)
		const next = points[index + 1].subtract(point).unitVector().multiply(strutSize).add(point)
		return <Line key={index} points={[point, next, prev, point]} className="beamStrut" style={{ fill: color, opacity: strutOpacity }} />
	})

	// Assemble the beam.
	return <g className={className} style={style}>
		{struts}
		<Line points={points} className="beamLine" style={{ stroke: color, strokeWidth: thickness }} />
	</g>
}
export const defaultBeam = {
	...defaultLine,
	thickness: 4,
	strutSize: 12,
	strutOpacity: 0.75,
	color: 'black',
	className: 'beam',
}

export function Hinge(props) {
	// Check input.
	let { position, radius, thickness, color, className, style } = processOptions(props, defaultHinge)
	position = ensureVector(position, 2)
	radius = ensureNumber(radius)
	thickness = ensureNumber(thickness)
	color = ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)

	// Set up the circle.
	return <circle cx={position.x} cy={position.y} r={radius} className={className} style={{ stroke: color, strokeWidth: thickness, ...style }} />
}
export const defaultHinge = {
	...defaultObject,
	position: Vector.zero2D,
	radius: 6,
	thickness: 2,
	color: defaultBeam.color,
	className: 'hinge',
}

/*
 * Below are various structural supports.
 */

// The defaultSupport is unherited by each of the default support objects.
const defaultSupport = {
	...defaultObject,
	position: Vector.zero2D,
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
	return <PositionedGroup rotate={angle - Math.PI / 2} {...{ position, className, style }}>
		<SupportBlock position={new Vector(0, height * positionFactor)} {...{ color, width, height }} />
		<Ground position={new Vector(0, height * (1 / 2 + positionFactor))} {...{ color, thickness, ...groundOptions }} />
	</PositionedGroup>
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
	return <PositionedGroup rotate={angle - Math.PI / 2} {...{ position, className, style }}>
		<SupportTriangle {...{ color, thickness, width, height }} />
		<Ground position={new Vector(0, height)} {...{ color, thickness, ...groundOptions }} />
		<Hinge {...{ color, thickness }} />
	</PositionedGroup>
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
	return <PositionedGroup rotate={angle - Math.PI / 2} {...{ position, className, style }}>
		<SupportBlock position={new Vector(0, height * positionFactor)} {...{ color, height, width }} />
		<Ground position={new Vector(0, height * (1 / 2 + positionFactor) + 2 * wheelRadius + thickness / 2)} {...{ color, thickness, ...groundOptions }} />
		<Wheels position={new Vector(0, height * (1 / 2 + positionFactor) + wheelRadius)} {...{ color, numWheels, wheelRadius, ...wheelsOptions }} />
	</PositionedGroup>
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
	return <PositionedGroup rotate={angle - Math.PI / 2} {...{ position, className, style }}>
		<SupportTriangle {...{ color, width, height }} />
		<Ground position={new Vector(0, height + 2 * wheelRadius + thickness)} {...{ color, thickness, ...groundOptions }} />
		<Wheels position={new Vector(0, height + wheelRadius + thickness / 2)} {...{ color, numWheels, wheelRadius, ...wheelsOptions }} />
		<Hinge {...{ color, thickness }} />
	</PositionedGroup>
}
export const defaultRollerHingeSupport = {
	...defaultHingeSupport,
	numWheels: defaultRollerSupport.numWheels,
	wheelRadius: defaultRollerSupport.wheelRadius,
	wheelsOptions: {},
}

/*
 * Below are various supporting elements for supports.
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

	return <PositionedGroup {...{ position, className, style }}>
		<rect className="groundRectangle" x={-width / 2} y={0} width={width} height={height} style={{ fill: color, opacity: rectangleOpacity }} />
		<Line className="groundLine" points={[new Vector(-width / 2, 0), new Vector(width / 2, 0)]} style={{ stroke: color, strokeWidth: thickness }} />
	</PositionedGroup >
}
export const defaultGround = {
	...defaultObject,
	position: Vector.zero2D,
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
	position: Vector.zero2D,
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
	position: Vector.zero2D,
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
	return <PositionedGroup {...{ position, className, style }}>
		{numberArray(0, numWheels - 1).map(index => <circle
			key={index}
			cx={(2 * index + 1 - numWheels) * wheelRadius}
			cy="0"
			r={wheelRadius}
			className="wheel"
			style={{ fill: color, ...wheelStyle }}
		/>)}
	</PositionedGroup>
}
export const defaultWheels = {
	...defaultObject,
	position: Vector.zero2D,
	color: defaultHinge.color,
	numWheels: defaultRollerSupport.numWheels,
	wheelRadius: defaultRollerSupport.wheelRadius,
	wheelStyle: {},
	className: 'wheels',
}