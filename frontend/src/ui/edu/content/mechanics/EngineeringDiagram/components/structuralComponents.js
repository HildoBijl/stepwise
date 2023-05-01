import React, { forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVectorArray } from 'step-wise/geometry'

import { useTransformedOrGraphicalValue } from 'ui/components/figures'
import { Group, Line, Polygon, Circle, Arc } from 'ui/components/figures/Drawing/SvgComponents'
import { defaultObject, useRefWithEventHandlers } from 'ui/components/figures/Drawing/SvgComponents/util'
import { defaultLine } from 'ui/components/figures/Drawing/SvgComponents/Line'

export const Beam = forwardRef((props, ref) => {
	// Check input.
	let { points, graphicalPoints, thickness, strutSize, strutOpacity, color, lineStyle, strutStyle, className, style } = processOptions(props, defaultBeam)
	points = ensureVectorArray(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
	thickness = ensureNumber(thickness)
	strutSize = ensureNumber(strutSize)
	strutOpacity = ensureNumber(strutOpacity)
	color = ensureString(color)
	lineStyle = ensureObject(lineStyle)
	strutStyle = ensureObject(strutStyle)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Render the struts.
	const struts = points.map((point, index) => {
		if (index === 0 || index === points.length - 1)
			return null
		if (point.equals(points[index - 1]) || point.equals(points[index + 1]))
			return null
		const prev = points[index - 1].subtract(point).normalize().multiply(strutSize).add(point)
		const next = points[index + 1].subtract(point).normalize().multiply(strutSize).add(point)
		return <Polygon key={index} graphicalPoints={[point, next, prev]} className="beamStrut" style={{ fill: color, opacity: strutOpacity, ...strutStyle }} />
	})

	// Assemble the beam.
	return <Group {...{ ref, className, style }}>
		{struts}
		<Line graphicalPoints={points} className="beamLine" style={{ stroke: color, strokeWidth: thickness, ...lineStyle }} />
	</Group>
})
export const defaultBeam = {
	...defaultLine,
	thickness: 6,
	strutSize: 12,
	strutOpacity: 0.75,
	color: 'black',
	lineStyle: {},
	strutStyle: {},
	className: 'beam',
}

export const Hinge = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, radius, graphicalRadius, thickness, color, className, style } = processOptions(props, defaultHinge)
	thickness = ensureNumber(thickness)
	color = ensureString(color)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the circle.
	return <Circle {...{ ref, center: position, graphicalCenter: graphicalPosition, radius, graphicalRadius, className, style: { stroke: color, strokeWidth: thickness, ...style } }} />
})
export const defaultHinge = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	radius: undefined,
	graphicalRadius: 6,
	thickness: 2,
	color: defaultBeam.color,
	className: 'hinge',
}

export const HalfHinge = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, radius, graphicalRadius, thickness, color, angle, className, style } = processOptions(props, defaultHalfHinge)
	thickness = ensureNumber(thickness)
	color = ensureString(color)
	angle = ensureNumber(angle)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Set up the arc.
	const startAngle = angle - Math.PI / 2
	const endAngle = angle + Math.PI / 2
	return <Arc {...{ ref, center: position, graphicalCenter: graphicalPosition, radius, graphicalRadius, startAngle, endAngle, className, style: { stroke: color, strokeWidth: thickness, ...style } }} />
})
export const defaultHalfHinge = {
	...defaultHinge,
	angle: Math.PI / 2,
}
