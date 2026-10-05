import type { Vector } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

import { getPositionTargets, type Position, resolvePosition } from './positions.ts'
import { getDistanceTargets, type Distance, resolveDistance } from './distances.ts'
import { useDrawingTargetBoundsMap } from './DrawingTargets/index.ts'

// Resolve a position to render coordinates. Return undefined if data is missing.
export function useResolvedPosition(position: Position): Vector | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetBoundsMap(getPositionTargets(position))
	return resolvePosition(position, coordinateSystem, { getTargetBounds: target => targetBounds.get(target) })
}

// Resolve a list of positions to render coordinates. Return undefined if any position cannot be resolved.
export function useResolvedPositions(positions: readonly Position[]): Vector[] | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetBoundsMap([...new Set(positions.flatMap(getPositionTargets))])
	const resolvedPositions: Vector[] = []
	for (const position of positions) {
		const resolved = resolvePosition(position, coordinateSystem, { getTargetBounds: target => targetBounds.get(target) })
		if (resolved === undefined) return undefined
		resolvedPositions.push(resolved)
	}
	return resolvedPositions
}

// Resolve a distance to pixels. Return undefined if data is missing.
export function useResolvedDistance(distance: Distance): number | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetBoundsMap(getDistanceTargets(distance))
	return resolveDistance(distance, coordinateSystem, { getTargetBounds: target => targetBounds.get(target) })
}
