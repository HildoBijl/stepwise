import type { Vector, VectorLike } from '@step-wise/geometry'

import type { Load, LoadInput } from '../loads'

/*
 * Points
 */

export type NamedPoint = {
	readonly name: string
	readonly position: Vector
}

export type NamedPointInput = {
	readonly name: string
	readonly position: VectorLike
}

/*
 * Loads
 */

export type LoadName = {
	readonly symbol: string
	readonly point?: string
	readonly suffix?: string | number
}

export type NamedLoad = {
	readonly load: Load
	readonly name: LoadName
}

export type NamedLoadInput = {
	readonly load: LoadInput
	readonly name: LoadName
}
