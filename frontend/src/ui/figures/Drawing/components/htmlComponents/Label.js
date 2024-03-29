
import React, { forwardRef } from 'react'

import { ensureNumber, processOptions, filterOptions, removeProperties } from 'step-wise/util'
import { Vector, ensureVector } from 'step-wise/geometry'

import { ensureReactElement } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.

import { useGraphicalVector, useGraphicalDistance } from '../../DrawingContext'

import { getAnchorFromAngle } from './util'
import Element, { defaultElement } from './Element'

export const defaultLabel = {
	...defaultElement,
	angle: -Math.PI * 3 / 4,
	distance: undefined,
	graphicalDistance: 6,
	anchor: undefined,
}

export const Label = forwardRef((props, ref) => {
	// Check input.
	let { children, position, graphicalPosition, distance, graphicalDistance, angle, anchor, rotate } = processOptions(props, defaultLabel)
	children = ensureReactElement(children)
	position = ensureVector(useGraphicalVector(position, graphicalPosition), 2)
	distance = ensureNumber(useGraphicalDistance(distance, graphicalDistance))
	angle = ensureNumber(angle)
	rotate = ensureNumber(rotate)
	anchor = anchor === undefined ? getAnchorFromAngle(angle - rotate + Math.PI) : ensureVector(anchor, 2)

	// Find the position shift and apply it.
	const delta = Vector.fromPolar(distance, angle)
	return <Element {...filterOptions(removeProperties(props, 'position'), defaultElement)} graphicalPosition={position.add(delta)} anchor={anchor}>{children}</Element>
})
Label.defaultProps = defaultLabel
Label.plotType = 'html'
export default Label
