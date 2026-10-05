import type { CSSProperties } from 'react'

import type { Vector } from '@step-wise/geometry'

export const lineStyle: CSSProperties = { fill: 'none', stroke: 'currentColor', strokeWidth: 1 }

// Turn a position into a string that can be used in an SVG path.
export function getPointPath(position: Vector): string {
	return `${position.x} ${position.y}`
}

// Turn a sequence of positions into a string that can be used in an SVG path.
export function getLinePath(positions: readonly Vector[], close = false): string {
	if (positions.length === 0) throw new Error('Invalid SVG line: expected at least one position.')
	return `M${positions.map(getPointPath).join(' L')}${close ? ' Z' : ''}`
}
