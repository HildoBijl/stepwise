import type { Vector } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

import { type Position, getPositionTargets, resolvePosition } from './positions.ts'
import { type Distance, getDistanceTargets, resolveDistance } from './distances.ts'
import { useDrawingTargetBoundsMap } from '../DrawingTargets/index.ts'

// Resolve a position to pixel coordinates. Return undefined if data is missing.
export function useResolvedPosition(position: Position | undefined): Vector | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetBoundsMap(position === undefined ? [] : getPositionTargets(position))
	if (position === undefined) return undefined
	return resolvePosition(position, coordinateSystem, { getTargetBounds: target => targetBounds.get(target) })
}

// Resolve a list of positions to pixel coordinates. Return undefined if any position cannot be resolved.
export function useResolvedPositions(positions: readonly Position[] | undefined): Vector[] | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetBoundsMap(positions === undefined ? [] : [...new Set(positions.flatMap(getPositionTargets))])
	if (positions === undefined) return undefined
	const resolvedPositions: Vector[] = []
	for (const position of positions) {
		const resolved = resolvePosition(position, coordinateSystem, { getTargetBounds: target => targetBounds.get(target) })
		if (resolved === undefined) return undefined
		resolvedPositions.push(resolved)
	}
	return resolvedPositions
}

// Resolve a distance to pixels. Return undefined if data is missing.
export function useResolvedDistance(distance: Distance | undefined): number | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetBoundsMap(distance === undefined ? [] : getDistanceTargets(distance))
	if (distance === undefined) return undefined
	return resolveDistance(distance, coordinateSystem, { getTargetBounds: target => targetBounds.get(target) })
}
