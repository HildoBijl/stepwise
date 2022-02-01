import React from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureVectorArray } from 'step-wise/CAS/linearAlgebra'

import { components as drawingComponents } from 'ui/components/figures/Drawing'

const { defaultObject, Line, defaultLine } = drawingComponents

export function Beam(props) {
	// Check input.
	let { points, thickness, strutSize, strutOpacity, color, lineStyle, strutStyle, className, style } = processOptions(props, defaultBeam)
	points = ensureVectorArray(points, 2)
	thickness = ensureNumber(thickness)
	strutSize = ensureNumber(strutSize)
	strutOpacity = ensureNumber(strutOpacity)
	color = ensureString(color)
	lineStyle = ensureObject(lineStyle)
	strutStyle = ensureObject(strutStyle)
	className = ensureString(className)
	style = ensureObject(style)

	// Render the struts.
	const struts = points.map((point, index) => {
		if (index === 0 || index === points.length - 1)
			return null
		const prev = points[index - 1].subtract(point).normalize().multiply(strutSize).add(point)
		const next = points[index + 1].subtract(point).normalize().multiply(strutSize).add(point)
		return <Line key={index} points={[point, next, prev, point]} className="beamStrut" style={{ fill: color, opacity: strutOpacity, ...strutStyle }} />
	})

	// Assemble the beam.
	return <g className={className} style={style}>
		{struts}
		<Line points={points} className="beamLine" style={{ stroke: color, strokeWidth: thickness, ...lineStyle }} />
	</g>
}
export const defaultBeam = {
	...defaultLine,
	thickness: 4,
	strutSize: 12,
	strutOpacity: 0.75,
	color: 'black',
	lineStyle: {},
	strutStyle: {},
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
	position: Vector.zero,
	radius: 6,
	thickness: 2,
	color: defaultBeam.color,
	className: 'hinge',
}