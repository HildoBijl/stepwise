import React, { forwardRef } from 'react'

import { ensureNumber, ensureString, ensureObject, processOptions } from 'step-wise/util'
import { ensureVectorArray } from 'step-wise/geometry'

import { useGraphicalVector } from 'ui/figures'
import { Group, Line, Polygon } from 'ui/figures/Drawing/components/svgComponents'
import { useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

export const defaultBeam = {
	...Line.defaultProps,
	thickness: 6,
	strutSize: 12,
	strutOpacity: 0.75,
	color: 'black',
	lineStyle: {},
	strutStyle: {},
	className: 'beam',
}

export const Beam = forwardRef((props, ref) => {
	// Check input.
	let { points, graphicalPoints, thickness, strutSize, strutOpacity, color, lineStyle, strutStyle, className, style } = processOptions(props, defaultBeam)
	points = ensureVectorArray(useGraphicalVector(points, graphicalPoints), 2)
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
		return <Polygon key={index} graphicalPoints={[point, next, prev]} className="beamStrut" style={{ strokeWidth: 0, fill: color, opacity: strutOpacity, ...strutStyle }} />
	})

	// Assemble the beam.
	return <Group className={className} {...{ ref, style }}>
		{struts}
		<Line graphicalPoints={points} className="beamLine" style={{ fill: 'none', stroke: color, strokeWidth: thickness, ...lineStyle }} />
	</Group>
})
Beam.defaultProps = defaultBeam
export default Beam
