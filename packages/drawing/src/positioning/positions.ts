import { ensureString, isPlainObject } from '@step-wise/js-utils'
import { type Rectangle, type Vector, type VectorLike, Vector as VectorClass, ensureVector, isVectorLike } from '@step-wise/geometry'

import type { DrawingCoordinateSystem } from '../transforms/index.ts'

import { anchors, type Anchor, type NamedAnchor } from './anchors.ts'

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

export type TargetPosition = {
	target: string
	anchor?: Anchor
	pixelOffset?: VectorLike
}

export type Position = VectorLike | DrawingPosition | PixelPosition | TargetPosition

export type PositionResolutionOptions = {
	getTargetBounds?: (target: string) => Rectangle | undefined
}

/*
 * Resolution functions.
 */

export function resolvePosition(position: Position, coordinateSystem: DrawingCoordinateSystem, options: PositionResolutionOptions = {}): Vector | undefined {
	if (isVectorLike(position)) return coordinateSystem.drawingToRender(ensureVector(position, { dimension: 2 }))
	if (!isPlainObject(position)) throw new Error('Invalid position: expected a drawing position, a pixel position, a target position, or a two-dimensional vector.')
	const hasPosition = 'position' in position
	const hasPixelPosition = 'pixelPosition' in position
	const hasTarget = 'target' in position
	if (Number(hasPosition) + Number(hasPixelPosition) + Number(hasTarget) !== 1)
		throw new Error('Invalid position: expected exactly one of "position", "pixelPosition", and "target".')
	if (hasPosition) return resolveDrawingPosition(position as DrawingPosition, coordinateSystem)
	if (hasPixelPosition) return resolvePixelPosition(position as PixelPosition, coordinateSystem)
	return resolveTargetPosition(position as TargetPosition, coordinateSystem, options)
}

export function getPositionTarget(position: Position): string | undefined {
	if (!isPlainObject(position) || !('target' in position)) return undefined
	return ensureString(position.target, { nonEmpty: true })
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

function resolveTargetPosition(position: TargetPosition, coordinateSystem: DrawingCoordinateSystem, options: PositionResolutionOptions): Vector | undefined {
	const target = ensureString(position.target, { nonEmpty: true })
	const bounds = options.getTargetBounds?.(target)
	if (!bounds) return undefined
	const anchor = resolveAnchor(position.anchor ?? anchors.center, coordinateSystem)
	const resolved = new VectorClass([
		bounds.min.x + (anchor.x + 1) * bounds.width / 2,
		bounds.min.y + (anchor.y + 1) * bounds.height / 2,
	])
	if (position.pixelOffset === undefined) return resolved
	return resolved.add(coordinateSystem.pixelVectorToRender(ensureVector(position.pixelOffset, { dimension: 2 })))
}

function resolveAnchor(anchor: Anchor, coordinateSystem: DrawingCoordinateSystem): Vector {
	if (typeof anchor === 'string') {
		const coordinates = namedAnchorCoordinates[anchor as NamedAnchor]
		if (!coordinates) throw new Error(`Invalid Drawing anchor: received "${anchor}".`)
		return new VectorClass(coordinates)
	}
	const vector = ensureVector(anchor, { dimension: 2 })
	return coordinateSystem.yDirection === 'up' ? new VectorClass(vector.x, -vector.y) : vector
}

const namedAnchorCoordinates: Record<NamedAnchor, VectorLike> = {
	center: [0, 0],
	left: [-1, 0],
	right: [1, 0],
	top: [0, -1],
	bottom: [0, 1],
	topLeft: [-1, -1],
	topRight: [1, -1],
	bottomLeft: [-1, 1],
	bottomRight: [1, 1],
}
