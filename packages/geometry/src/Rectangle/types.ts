import type { VectorData, VectorLike } from '../Vector'

export type RectangleObject = {
	min?: VectorLike
	max?: VectorLike
	size?: VectorLike
}

export type RectangleData = {
	min: VectorData
	max: VectorData
}

export type RectangleInput = RectangleObject
