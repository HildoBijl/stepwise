
import React, { forwardRef } from 'react'

import { processOptions, filterOptions, removeProperties } from 'step-wise/util'
import { ensureVector, ensureVectorArray } from 'step-wise/geometry'

import { ensureReactElement } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

import { useGraphicalVector } from '../../DrawingContext'

import Label, { defaultLabel } from './Label'

export const defaultLineLabel = {
	...removeProperties(defaultLabel, ['position', 'graphicalPosition']),
	points: undefined,
	graphicalPoints: undefined,
	oppositeTo: undefined,
	graphicalOppositeTo: undefined,
}

export const LineLabel = forwardRef((props, ref) => {
	// Check input.
	let { children, points, graphicalPoints, oppositeTo, graphicalOppositeTo } = processOptions(props, defaultLineLabel)
	children = ensureReactElement(children)
	points = ensureVectorArray(useGraphicalVector(points, graphicalPoints), 2, 2)
	oppositeTo = ensureVector(useGraphicalVector(oppositeTo, graphicalOppositeTo))

	// Determine the angle.
	const delta = points[1].subtract(points[0])
	const relative = oppositeTo.subtract(points[0])
	const sign = Math.sign(delta.y * relative.x - delta.x * relative.y) // Cross product.
	const angle = delta.argument + sign * Math.PI / 2

	// Set up the Label.
	const position = points[0].interpolate(points[1])
	return <Label {...filterOptions(props, defaultLabel)} graphicalPosition={position} angle={angle}>{children}</Label>
})
LineLabel.defaultProps = defaultLineLabel
LineLabel.plotType = 'html'
export default LineLabel
