import type { VectorLike, VectorStorageValue } from '../Vector/index.ts'

export type RectangleCorners = readonly [VectorLike, VectorLike]

export type RectangleObject = {
	min?: VectorLike
	max?: VectorLike
	size?: VectorLike
}

export type RectangleInput = RectangleCorners | RectangleObject

export type RectangleStorageValue = {
	min: VectorStorageValue
	max: VectorStorageValue
}
