import type { Vector } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

import { getPositionTarget, type Position, resolvePosition } from './positions.ts'
import { type Distance, resolveDistance } from './distances.ts'
import { useDrawingTargetBounds } from './DrawingTargets/index.ts'

export function useResolvedPosition(position: Position): Vector | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const target = getPositionTarget(position)
	const targetBounds = useDrawingTargetBounds(target)
	return resolvePosition(position, coordinateSystem, {
		getTargetBounds: requestedTarget => requestedTarget === target ? targetBounds : undefined,
	})
}

export function useResolvedDistance(distance: Distance): number {
	return resolveDistance(distance, useDrawingCoordinateSystem())
}
