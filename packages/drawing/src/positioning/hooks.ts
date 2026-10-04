import type { Vector } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

import { getPositionTargets, type Position, resolvePosition } from './positions.ts'
import { getDistanceTargets, type Distance, resolveDistance } from './distances.ts'
import { useDrawingTargetBoundsMap } from './DrawingTargets/index.ts'

export function useResolvedPosition(position: Position): Vector | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetBoundsMap(getPositionTargets(position))
	return resolvePosition(position, coordinateSystem, { getTargetBounds: target => targetBounds.get(target) })
}

export function useResolvedDistance(distance: Distance): number | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetBoundsMap(getDistanceTargets(distance))
	return resolveDistance(distance, coordinateSystem, { getTargetBounds: target => targetBounds.get(target) })
}
