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

export type CalculatedPosition = {
	positions: readonly Position[]
	calculate: (positions: readonly Vector[]) => VectorLike
}

export type Position = VectorLike | DrawingPosition | PixelPosition | TargetPosition | CalculatedPosition

export type PositionResolutionOptions = {
	getTargetBounds?: (target: string) => Rectangle | undefined
}

/*
 * Resolution functions.
 */

// Generally, resolve a position to a Vector in the render coordinate system.
export function resolvePosition(position: Position, coordinateSystem: DrawingCoordinateSystem, options: PositionResolutionOptions = {}): Vector | undefined {
	// If the position is a vector-like object, treat it as a drawing position and resolve it accordingly.
	if (isVectorLike(position)) return coordinateSystem.drawingToRender(ensureVector(position, { dimension: 2 }))

	// Check which type of position is provided.
	if (!isPlainObject(position)) throw new Error('Invalid position: expected a drawing position, a pixel position, a target position, a calculated position, or a two-dimensional vector.')
	const hasPosition = 'position' in position
	const hasPixelPosition = 'pixelPosition' in position
	const hasTarget = 'target' in position
	const isCalculated = 'positions' in position || 'calculate' in position
	if (Number(hasPosition) + Number(hasPixelPosition) + Number(hasTarget) + Number(isCalculated) !== 1) throw new Error('Invalid position: expected exactly one drawing position, pixel position, target position, or calculated position.')

	// Resolve the position based on its type.
	if (hasPosition) return resolveDrawingPosition(position as DrawingPosition, coordinateSystem)
	if (hasPixelPosition) return resolvePixelPosition(position as PixelPosition, coordinateSystem)
	if (hasTarget) return resolveTargetPosition(position as TargetPosition, coordinateSystem, options)
	return resolveCalculatedPosition(position as CalculatedPosition, coordinateSystem, options)
}

// For a drawing position, convert the drawing coordinates to render coordinates.
function resolveDrawingPosition(position: DrawingPosition, coordinateSystem: DrawingCoordinateSystem): Vector {
	const drawingPosition = ensureVector(position.position, { dimension: 2 })
	const pixelPosition = coordinateSystem.drawingToPixel(drawingPosition)
	const pixelOffset = position.pixelOffset === undefined ? undefined : ensureVector(position.pixelOffset, { dimension: 2 })
	return coordinateSystem.pixelToRender(pixelOffset ? pixelPosition.add(pixelOffset) : pixelPosition)
}

// For a pixel position, convert the pixel coordinates to render coordinates.
function resolvePixelPosition(position: PixelPosition, coordinateSystem: DrawingCoordinateSystem): Vector {
	return coordinateSystem.pixelToRender(ensureVector(position.pixelPosition, { dimension: 2 }))
}

// For a target position, resolve the target's bounds and anchor to determine the render coordinates.
function resolveTargetPosition(position: TargetPosition, coordinateSystem: DrawingCoordinateSystem, options: PositionResolutionOptions): Vector | undefined {
	// Get the bounds from the target.
	const target = ensureString(position.target, { nonEmpty: true })
	const bounds = options.getTargetBounds?.(target)
	if (!bounds) return undefined

	// Resolve and apply the anchor.
	const anchor = resolveAnchor(position.anchor ?? anchors.center, coordinateSystem)
	const resolved = new VectorClass([
		bounds.min.x + (anchor.x + 1) * bounds.width / 2,
		bounds.min.y + (anchor.y + 1) * bounds.height / 2,
	])

	// Apply any pixel offset if provided.
	if (position.pixelOffset === undefined) return resolved
	return resolved.add(coordinateSystem.pixelVectorToRender(ensureVector(position.pixelOffset, { dimension: 2 })))
}


// For a calculated position, resolve all the individual positions and then apply the provided calculation function.
function resolveCalculatedPosition(position: CalculatedPosition, coordinateSystem: DrawingCoordinateSystem, options: PositionResolutionOptions): Vector | undefined {
	if (!Array.isArray(position.positions) || position.positions.length === 0) throw new Error('Invalid calculated position: expected a non-empty positions array.')
	if (typeof position.calculate !== 'function') throw new Error('Invalid calculated position: expected a calculate function.')
	const resolvedPositions: Vector[] = []
	for (const input of position.positions) {
		const resolved = resolvePosition(input, coordinateSystem, options)
		if (!resolved) return undefined
		resolvedPositions.push(resolved)
	}
	return ensureVector(position.calculate(resolvedPositions), { dimension: 2 })
}

/*
 * Collecting position targets.
 */

// Collect all unique target names from a position, including nested positions in calculated positions.
export function getPositionTargets(position: Position): string[] {
	const targets = new Set<string>()
	collectPositionTargets(position, targets)
	return [...targets]
}

// Recursively collect target names from a position and its nested positions.
function collectPositionTargets(position: Position, targets: Set<string>): void {
	if (isVectorLike(position) || !isPlainObject(position)) return
	if ('target' in position) {
		targets.add(ensureString(position.target, { nonEmpty: true }))
		return
	}
	if ('positions' in position && Array.isArray(position.positions)) position.positions.forEach(input => { collectPositionTargets(input as Position, targets) })
}

/*
 * Anchor resolution.
 */

// Resolve an anchor to a vector in the render coordinate system, taking into account the drawing coordinate system's y-direction.
function resolveAnchor(anchor: Anchor, coordinateSystem: DrawingCoordinateSystem): Vector {
	if (typeof anchor === 'string') {
		const coordinates = namedAnchorCoordinates[anchor as NamedAnchor]
		if (!coordinates) throw new Error(`Invalid Drawing anchor: received "${anchor}".`)
		return new VectorClass(coordinates)
	}
	const vector = ensureVector(anchor, { dimension: 2 })
	return coordinateSystem.yDirection === 'up' ? new VectorClass(vector.x, -vector.y) : vector
}

// A mapping of named anchors to their corresponding vector coordinates in the render coordinate system.
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
