import type { Vector, VectorLike } from '@step-wise/geometry'

import type { Load, LoadLike } from '../loads'

/*
 * Points
 */

export type NamedPoint = {
	name: string
	position: Vector
}

export type NamedPointLike = {
	name: string
	position: VectorLike
}

/*
 * Loads
 */

export type LoadName = {
	symbol: string
	point?: string
	suffix?: string | number
}

export type NamedLoad = {
	load: Load
	name: LoadName
}

export type NamedLoadLike = {
	load: LoadLike
	name: LoadName
}
