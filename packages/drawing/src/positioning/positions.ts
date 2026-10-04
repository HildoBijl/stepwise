import { isPlainObject } from '@step-wise/js-utils'
import { type Vector, type VectorLike, ensureVector, isVectorLike } from '@step-wise/geometry'

import type { DrawingCoordinateSystem } from '../transforms/index.ts'

/*
 * Types.
 */

export type DrawingPosition = {
	position: VectorLike
	pixelOffset?: VectorLike
}

export type PixelPosition = {
	pixelPosition: VectorLike
}

export type Position = VectorLike | DrawingPosition | PixelPosition

/*
 * Resolution functions.
 */

export function resolvePosition(position: Position, coordinateSystem: DrawingCoordinateSystem): Vector {
	if (isVectorLike(position)) return coordinateSystem.drawingToRender(ensureVector(position, { dimension: 2 }))
	if (!isPlainObject(position)) throw new Error('Invalid position: expected a drawing position, a pixel position, or a two-dimensional vector.')
	const hasPosition = 'position' in position
	const hasPixelPosition = 'pixelPosition' in position
	if (hasPosition === hasPixelPosition) throw new Error('Invalid position: expected exactly one of "position" and "pixelPosition".')
	return hasPosition ? resolveDrawingPosition(position as DrawingPosition, coordinateSystem) : resolvePixelPosition(position as PixelPosition, coordinateSystem)
}

function resolveDrawingPosition(position: DrawingPosition, coordinateSystem: DrawingCoordinateSystem): Vector {
	const drawingPosition = ensureVector(position.position, { dimension: 2 })
	const pixelPosition = coordinateSystem.drawingToPixel(drawingPosition)
	const pixelOffset = position.pixelOffset === undefined ? undefined : ensureVector(position.pixelOffset, { dimension: 2 })
	return coordinateSystem.pixelToRender(pixelOffset ? pixelPosition.add(pixelOffset) : pixelPosition)
}

function resolvePixelPosition(position: PixelPosition, coordinateSystem: DrawingCoordinateSystem): Vector {
	return coordinateSystem.pixelToRender(ensureVector(position.pixelPosition, { dimension: 2 }))
}
