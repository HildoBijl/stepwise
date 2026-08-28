
import React, { forwardRef } from 'react'

import { mergeDefaults, pickFromDefaults, omitKeys } from '@step-wise/js-utils'
import { ensureVector, ensureVectorArray } from '@step-wise/geometry'

import { ensureReactElement } from 'util/index' // Unit test import issue: use 'util/index' because the test runner otherwise resolves Node's built-in util package.

import { useGraphicalVector } from '../../DrawingContext'

import Label, { defaultLabel } from './Label'

export const defaultLineLabel = {
	...omitKeys(defaultLabel, ['position', 'graphicalPosition']),
	points: undefined,
	graphicalPoints: undefined,
	oppositeTo: undefined,
	graphicalOppositeTo: undefined,
}

export const LineLabel = forwardRef((props, ref) => {
	// Check input.
	let { children, points, graphicalPoints, oppositeTo, graphicalOppositeTo } = mergeDefaults(props, defaultLineLabel)
	children = ensureReactElement(children)
	points = ensureVectorArray(useGraphicalVector(points, graphicalPoints), { dimension: 2, length: 2 })
	oppositeTo = ensureVector(useGraphicalVector(oppositeTo, graphicalOppositeTo))

	// Determine the angle.
	const delta = points[1].subtract(points[0])
	const relative = oppositeTo.subtract(points[0])
	const sign = Math.sign(delta.y * relative.x - delta.x * relative.y) // Cross product.
	const angle = delta.angle + sign * Math.PI / 2

	// Set up the Label.
	const position = points[0].interpolate(points[1])
	return <Label {...pickFromDefaults(props, defaultLabel)} graphicalPosition={position} angle={angle}>{children}</Label>
})
LineLabel.defaultProps = defaultLineLabel
LineLabel.plotType = 'html'
export default LineLabel
