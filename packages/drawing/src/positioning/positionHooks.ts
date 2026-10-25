import type { Vector } from '@step-wise/geometry'

import { useDrawingTargetRenderBoundsMap } from '../DrawingTargets/renderBoundsHooks.ts'
import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

import { type Position, getPositionTargets, resolvePosition } from './positions.ts'

// Resolve a position and return it in drawing coordinates. Return undefined if required data is missing.
export function useDrawingPosition(position: Position | undefined): Vector | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const pixelPosition = useDrawingPixelPosition(position)
	return pixelPosition && coordinateSystem.pixelToDrawing(pixelPosition)
}

// Resolve multiple positions to drawing coordinates, preserving unresolved entries as undefined.
export function useDrawingPositions(positions: readonly Position[] | undefined): (Vector | undefined)[] | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const pixelPositions = useDrawingPixelPositions(positions)
	return pixelPositions?.map(position => position && coordinateSystem.pixelToDrawing(position))
}

// Resolve a position and return it in pixel coordinates. Return undefined if required data is missing.
export function useDrawingPixelPosition(position: Position | undefined): Vector | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetRenderBoundsMap(position === undefined ? [] : getPositionTargets(position))
	if (position === undefined) return undefined
	return resolvePosition(position, coordinateSystem, target => targetBounds.get(target))
}

// Resolve multiple positions to pixel coordinates, preserving unresolved entries as undefined.
export function useDrawingPixelPositions(positions: readonly Position[] | undefined): (Vector | undefined)[] | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetRenderBoundsMap(positions === undefined ? [] : [...new Set(positions.flatMap(getPositionTargets))])
	if (positions === undefined) return undefined
	return positions.map(position => resolvePosition(position, coordinateSystem, target => targetBounds.get(target)))
}
