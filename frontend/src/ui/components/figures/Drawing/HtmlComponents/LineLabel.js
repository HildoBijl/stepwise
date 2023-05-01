
import React from 'react'

import { processOptions, filterOptions, removeProperties } from 'step-wise/util/objects'
import { Vector, ensureVector, ensureVectorArray } from 'step-wise/geometry'

import { ensureReactElement } from 'util/react'

import { useTransformedOrGraphicalValue } from '../DrawingContext'

import Label, { defaultLabel } from './Label'

const defaultLineLabel = {
	...removeProperties(defaultLabel, ['position', 'graphicalPosition']),
	points: undefined,
	graphicalPoints: [Vector.i, Vector.zero],
	oppositeTo: undefined,
	graphicalOppositeTo: undefined,
}
export { defaultLineLabel }

export default function LineLabel(props) {
	// Check input.
	let { children, points, graphicalPoints, oppositeTo, graphicalOppositeTo } = processOptions(props, defaultLineLabel)
	children = ensureReactElement(children)
	points = ensureVectorArray(useTransformedOrGraphicalValue(points, graphicalPoints), 2, 2)
	oppositeTo = ensureVector(useTransformedOrGraphicalValue(oppositeTo, graphicalOppositeTo))

	// Determine the angle.
	const delta = points[1].subtract(points[0])
	const relative = oppositeTo.subtract(points[0])
	const sign = Math.sign(delta.y * relative.x - delta.x * relative.y) // Cross product.
	const angle = delta.argument + sign * Math.PI / 2

	// Set up the Label.
	const position = points[0].interpolate(points[1])
	return <Label {...filterOptions(props, defaultLabel)} graphicalPosition={position} angle={angle}>{children}</Label>
}
