
import React from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { processOptions, filterOptions, removeProperties } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry'

import { ensureReactElement } from 'util/react'

import { useTransformedOrGraphicalValue, useScaledOrGraphicalValue } from '../DrawingContext'

import { getAnchorFromAngle } from './util'
import Element, { defaultElement } from './Element'

const defaultLabel = {
	...defaultElement,
	angle: -Math.PI * 3 / 4,
	distance: undefined,
	graphicalDistance: 6,
	anchor: undefined,
}
export { defaultLabel }

export default function Label(props) {
	// Check input.
	let { children, position, graphicalPosition, distance, graphicalDistance, angle, anchor } = processOptions(props, defaultLabel)
	children = ensureReactElement(children)
	position = ensureVector(useTransformedOrGraphicalValue(position, graphicalPosition), 2)
	distance = ensureNumber(useScaledOrGraphicalValue(distance, graphicalDistance))
	angle = ensureNumber(angle)
	anchor = anchor === undefined ? getAnchorFromAngle(angle + Math.PI) : ensureVector(anchor, 2)

	// Find the position shift and apply it.
	const delta = Vector.fromPolar(distance, angle)
	return <Element {...filterOptions(removeProperties(props, 'position'), defaultElement)} graphicalPosition={position.add(delta)} anchor={anchor}>{children}</Element>
}
