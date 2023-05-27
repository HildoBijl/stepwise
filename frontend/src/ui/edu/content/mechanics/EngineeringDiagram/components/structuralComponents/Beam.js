import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { ensureVectorArray } from 'step-wise/geometry'

import { useGraphicalVector } from 'ui/components/figures'
import { Group, Line, Polygon } from 'ui/components/figures/Drawing/components/svgTemp'
import { useRefWithEventHandlers } from 'ui/components/figures/Drawing/components/svgTemp/util'

const useStyles = makeStyles((theme) => ({
	beam: {
		'& .beamLine': {
			fill: 'none',
		},
		'& .beamStrut': {
			'stroke-width': 0,
		},
	},
}))

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
		return <Polygon key={index} graphicalPoints={[point, next, prev]} className="beamStrut" style={{ fill: color, opacity: strutOpacity, ...strutStyle }} />
	})

	// Assemble the beam.
	const classes = useStyles()
	return <Group className={clsx(classes.beam, className)} {...{ ref, style }}>
		{struts}
		<Line graphicalPoints={points} className="beamLine" style={{ stroke: color, strokeWidth: thickness, ...lineStyle }} />
	</Group>
})
Beam.defaultProps = defaultBeam
export default Beam
