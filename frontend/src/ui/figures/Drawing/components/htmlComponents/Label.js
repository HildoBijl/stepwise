
import React, { forwardRef } from 'react'

import { ensureNumber, mergeDefaults, pickFromDefaults, omitKeys } from '@step-wise/js-utils'
import { Vector, ensureVector } from '@step-wise/geometry'

import { ensureReactElement } from 'util/index' // Unit test import issue: use 'util/index' because the test runner otherwise resolves Node's built-in util package.

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
	let { children, position, graphicalPosition, distance, graphicalDistance, angle, anchor, rotate } = mergeDefaults(props, defaultLabel)
	children = ensureReactElement(children)
	position = ensureVector(useGraphicalVector(position, graphicalPosition), { dimension: 2 })
	distance = ensureNumber(useGraphicalDistance(distance, graphicalDistance))
	angle = ensureNumber(angle)
	rotate = ensureNumber(rotate)
	anchor = anchor === undefined ? getAnchorFromAngle(angle - rotate + Math.PI) : ensureVector(anchor, { dimension: 2 })

	// Find the position shift and apply it.
	const delta = Vector.fromPolar(distance, angle)
	return <Element {...pickFromDefaults(omitKeys(props, ['position']), defaultElement)} graphicalPosition={position.add(delta)} anchor={anchor}>{children}</Element>
})
Label.defaultProps = defaultLabel
Label.plotType = 'html'
export default Label
