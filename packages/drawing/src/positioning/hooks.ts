import type { Vector } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

import { type Position, resolvePosition } from './positions.ts'
import { type Distance, resolveDistance } from './distances.ts'

export function useResolvedPosition(position: Position): Vector {
	return resolvePosition(position, useDrawingCoordinateSystem())
}

export function useResolvedDistance(distance: Distance): number {
	return resolveDistance(distance, useDrawingCoordinateSystem())
}
