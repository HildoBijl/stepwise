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
	position: VectorLike
	angle: number
	applicationPointAt?: ApplicationPointPosition
}

export type MomentLike = {
	position: VectorLike
	clockwise: boolean
	openingAngle?: number
}

export type LoadLike = (ForceLike & { type: typeof loadTypes.force }) | (MomentLike & { type: typeof loadTypes.moment })

/*
 * Loads
 */

export const applicationPointPositions = ['start', 'end'] as const
export type ApplicationPointPosition = typeof applicationPointPositions[number]

export type Force = {
	type: typeof loadTypes.force
	position: Vector
	angle: number
	applicationPointAt: ApplicationPointPosition
}

export type Moment = {
	type: typeof loadTypes.moment
	position: Vector
	clockwise: boolean
	openingAngle: number
}

export type Load = Force | Moment
