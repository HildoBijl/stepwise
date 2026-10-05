import { first, last } from '@step-wise/js-utils'
import type { Vector } from '@step-wise/geometry'

import { getArrowHeadInset } from './ArrowHead.tsx'

// Turn a position into a string that can be used in an SVG path.
export function getPointPath(position: Vector): string {
	return `${position.x} ${position.y}`
}

// Turn a sequence of positions into a string that can be used in an SVG path.
export function getLinePath(positions: readonly Vector[], close = false): string {
	if (positions.length === 0) throw new Error('Invalid SVG line: expected at least one position.')
	return `M${positions.map(getPointPath).join(' L')}${close ? ' Z' : ''}`
}

// Determine the endpoint directions and pull the path endpoints underneath any arrowheads.
export function prepareArrowedPositions(positions: readonly Vector[], startArrowSize?: number, endArrowSize?: number, inputDirections?: { startDirection: Vector; endDirection: Vector }): {
	directions: { startDirection: Vector; endDirection: Vector }
	shaftPositions: Vector[]
} {
	// Find the first and last distinct positions in the sequence.
	if (positions.length < 2) throw new Error('Invalid arrowed path positions: expected at least two positions.')
	const startIndex = positions.findIndex((position, index) => index > 0 && !position.equals(first(positions)))
	const reversedEndIndex = [...positions].reverse().findIndex((position, index) => index > 0 && !position.equals(last(positions)))
	if (startIndex === -1 || reversedEndIndex === -1) throw new Error('Invalid arrowed path positions: expected at least two distinct positions.')
	const endIndex = positions.length - 1 - reversedEndIndex

	// Determine the directions of the arrowheads, using the provided directions if available, or calculating them from the positions.
	const startDirection = inputDirections?.startDirection.normalize() ?? first(positions).subtract(positions[startIndex]).normalize()
	const endDirection = inputDirections?.endDirection.normalize() ?? last(positions).subtract(positions[endIndex]).normalize()
	
	// Pull the endpoints of the shaft underneath any arrowheads, but do not pull them past the midpoint of the first/last segment.
	const shaftPositions = [...positions]
	if (startArrowSize !== undefined) {
		const segmentLength = first(positions).distanceTo(positions[startIndex])
		shaftPositions[0] = first(positions).subtract(startDirection.multiply(Math.min(getArrowHeadInset(startArrowSize), segmentLength / 2)))
	}
	if (endArrowSize !== undefined) {
		const segmentLength = last(positions).distanceTo(positions[endIndex])
		shaftPositions[shaftPositions.length - 1] = last(positions).subtract(endDirection.multiply(Math.min(getArrowHeadInset(endArrowSize), segmentLength / 2)))
	}

	// Return the calculated directions and the adjusted shaft positions.
	return { directions: { startDirection, endDirection }, shaftPositions }
}
