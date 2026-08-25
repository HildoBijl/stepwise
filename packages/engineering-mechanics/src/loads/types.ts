import type { Vector, VectorLike } from '@step-wise/geometry'

/*
 * Types of loads
 */

export const loadTypes = {
	force: 'Force',
	moment: 'Moment',
} as const
export type LoadType = typeof loadTypes[keyof typeof loadTypes]

/*
 * Load creation
 */

export type ForceLike = {
	readonly position: VectorLike
	readonly angle: number
	readonly applicationPointAt?: ApplicationPointPosition
	readonly magnitudeFactor?: number
}

export type MomentLike = {
	readonly position: VectorLike
	readonly clockwise: boolean
	readonly openingAngle?: number
}

export type LoadLike = (ForceLike & { type: typeof loadTypes.force }) | (MomentLike & { type: typeof loadTypes.moment })

/*
 * Loads
 */

export const applicationPointPositions = ['start', 'end'] as const
export type ApplicationPointPosition = typeof applicationPointPositions[number]

export type Force = {
	readonly type: typeof loadTypes.force
	readonly position: Vector
	readonly angle: number
	readonly applicationPointAt: ApplicationPointPosition
	readonly magnitudeFactor: number
}

export type Moment = {
	readonly type: typeof loadTypes.moment
	readonly position: Vector
	readonly clockwise: boolean
	readonly openingAngle: number
}

export type Load = Force | Moment
