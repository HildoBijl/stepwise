import type { Vector, VectorLike } from '@step-wise/geometry'

/*
 * Types of loads
 */

export const ForceType = 'Force'
export type ForceType = typeof ForceType
export const MomentType = 'Moment'
export type MomentType = typeof MomentType
export type LoadType = ForceType | MomentType

/*
 * Load creation
 */

export type ForceInput = {
	readonly position: VectorLike
	readonly angle: number
	readonly applicationPointAt?: ApplicationPointPosition
	readonly relativeMagnitude?: number
}

export type MomentInput = {
	readonly position: VectorLike
	readonly clockwise: boolean
	readonly openingDirection?: number
}

export type LoadInput = (ForceInput & { readonly type: ForceType }) | (MomentInput & { readonly type: MomentType })

/*
 * Loads
 */

const applicationPointPositions = ['start', 'end'] as const
export type ApplicationPointPosition = typeof applicationPointPositions[number]

export { applicationPointPositions as loadApplicationPointPositions }

export type Force = {
	readonly type: ForceType
	readonly position: Vector
	readonly angle: number
	readonly applicationPointAt: ApplicationPointPosition
	readonly relativeMagnitude: number
}

export type Moment = {
	readonly type: MomentType
	readonly position: Vector
	readonly clockwise: boolean
	readonly openingDirection: number
}

export type Load = Force | Moment
