
import React from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { processOptions, filterOptions, removeProperties } from 'step-wise/util/objects'
import { Vector, ensureCorner } from 'step-wise/geometry'

import { ensureReactElement } from 'util/react'

import { useTransformedOrGraphicalValue, useScaledOrGraphicalValue } from '../DrawingContext'

import Element, { defaultElement } from './Element'

export const defaultCornerLabel = {
	...removeProperties(defaultElement, ['position', 'graphicalPosition']),
	points: undefined,
	graphicalPoints: [Vector.i, Vector.zero, Vector.j],
	size: undefined,
	graphicalSize: 30,
}

export default function CornerLabel(props) {
	// Check input.
	let { children, points, graphicalPoints, size, graphicalSize } = processOptions(props, defaultCornerLabel)
	children = ensureReactElement(children)
	points = ensureCorner(useTransformedOrGraphicalValue(points, graphicalPoints), 2)
	size = ensureNumber(useScaledOrGraphicalValue(size, graphicalSize))

	// Calculate the given position. Use an adjustment on the size of the corner: smaller angles should give a larger distance. For this adjustment, pretend the label is circular with the given size as double the radius.
	const point = points[1]
	const vector1 = points[0].subtract(point).normalize()
	const vector2 = points[2].subtract(point).normalize()
	const adjustedDistance = size / 2 * Math.sqrt(2 / Math.max(0.1, 1 - vector1.dotProduct(vector2)))
	const delta = vector1.interpolate(vector2).normalize().multiply(adjustedDistance)
	return <Element {...filterOptions(props, defaultElement)} graphicalPosition={point.add(delta)}>{children}</Element>
}
