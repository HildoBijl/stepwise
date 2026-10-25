import { ensureNumber, isPlainObject } from '@step-wise/js-utils'
import type { Vector } from '@step-wise/geometry'

import type { DrawingCoordinateSystem } from '../transforms/index.ts'

import { type GetDrawingTargetBounds, type Position, getPositionTargets, resolvePosition } from './positions.ts'

/*
 * Types.
 */

export type DrawingDistance = {
	distance: number
	pixelOffset?: number
}

export type PixelDistance = {
	pixelDistance: number
}

export type CalculatedDistance = {
	positions: readonly Position[]
	calculate: (positions: readonly Vector[]) => number
}

export type Distance = number | DrawingDistance | PixelDistance | CalculatedDistance

/*
 * Resolution functions.
 */

// Generally, resolve a distance to a number in pixels.
export function resolveDistance(distance: Distance, coordinateSystem: DrawingCoordinateSystem, getTargetBounds?: GetDrawingTargetBounds): number | undefined {
	if (typeof distance === 'number') return resolveDrawingDistance({ distance }, coordinateSystem)
	if (!isPlainObject(distance)) throw new Error('Invalid distance: expected a drawing distance, a pixel distance, a calculated distance, or a number.')
	const hasDistance = 'distance' in distance
	const hasPixelDistance = 'pixelDistance' in distance
	const isCalculated = 'positions' in distance || 'calculate' in distance
	if (Number(hasDistance) + Number(hasPixelDistance) + Number(isCalculated) !== 1) throw new Error('Invalid distance: expected exactly one drawing distance, pixel distance, or calculated distance.')
	if (hasDistance) return resolveDrawingDistance(distance as DrawingDistance, coordinateSystem)
	if (hasPixelDistance) return resolvePixelDistance(distance as PixelDistance)
	return resolveCalculatedDistance(distance as CalculatedDistance, coordinateSystem, getTargetBounds)
}

// For a drawing distance, convert it to pixels using the drawing coordinate system's scale and apply any pixel offset.
function resolveDrawingDistance(distance: DrawingDistance, coordinateSystem: DrawingCoordinateSystem): number {
	const drawingDistance = ensureNumber(distance.distance)
	const pixelOffset = ensureNumber(distance.pixelOffset ?? 0)
	const scale = Math.sqrt(Math.abs(coordinateSystem.drawingToPixelTransformation.determinant))
	return drawingDistance * scale + pixelOffset
}

// For a pixel distance, simply return the pixel distance value.
function resolvePixelDistance(distance: PixelDistance): number {
	return ensureNumber(distance.pixelDistance)
}

// For a calculated distance, resolve all the individual positions and then apply the provided calculation function.
function resolveCalculatedDistance(distance: CalculatedDistance, coordinateSystem: DrawingCoordinateSystem, getTargetBounds?: GetDrawingTargetBounds): number | undefined {
	if (!Array.isArray(distance.positions) || distance.positions.length === 0) throw new Error('Invalid calculated distance: expected a non-empty positions array.')
	if (typeof distance.calculate !== 'function') throw new Error('Invalid calculated distance: expected a calculate function.')
	const resolvedPositions: Vector[] = []
	for (const position of distance.positions) {
		const resolved = resolvePosition(position, coordinateSystem, getTargetBounds)
		if (!resolved) return undefined
		resolvedPositions.push(resolved)
	}
	return ensureNumber(distance.calculate(resolvedPositions))
}

// Collect all unique target names from the positions used by a calculated distance.
export function getDistanceTargets(distance: Distance): string[] {
	if (typeof distance === 'number' || !isPlainObject(distance) || !('positions' in distance) || !Array.isArray(distance.positions)) return []
	return [...new Set(distance.positions.flatMap(position => getPositionTargets(position as Position)))]
}
