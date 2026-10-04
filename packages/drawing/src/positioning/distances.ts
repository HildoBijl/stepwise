import { ensureNumber, isPlainObject } from '@step-wise/js-utils'

import type { DrawingCoordinateSystem } from '../transforms/index.ts'

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

export type Distance = number | DrawingDistance | PixelDistance

/*
 * Resolution functions.
 */

export function resolveDistance(distance: Distance, coordinateSystem: DrawingCoordinateSystem): number {
	if (typeof distance === 'number') return resolveDrawingDistance({ distance }, coordinateSystem)
	if (!isPlainObject(distance)) throw new Error('Invalid distance: expected a drawing distance, a pixel distance, or a number.')
	const hasDistance = 'distance' in distance
	const hasPixelDistance = 'pixelDistance' in distance
	if (hasDistance === hasPixelDistance) throw new Error('Invalid distance: expected exactly one of "distance" and "pixelDistance".')
	return hasDistance ? resolveDrawingDistance(distance as DrawingDistance, coordinateSystem) : resolvePixelDistance(distance as PixelDistance)
}

function resolveDrawingDistance(distance: DrawingDistance, coordinateSystem: DrawingCoordinateSystem): number {
	const drawingDistance = ensureNumber(distance.distance)
	const pixelOffset = ensureNumber(distance.pixelOffset ?? 0)
	const scale = Math.sqrt(Math.abs(coordinateSystem.drawingToPixelTransformation.determinant))
	return drawingDistance * scale + pixelOffset
}

function resolvePixelDistance(distance: PixelDistance): number {
	return ensureNumber(distance.pixelDistance)
}
