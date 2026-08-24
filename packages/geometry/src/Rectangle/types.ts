import type { VectorLike, VectorStorageValue } from '../Vector'

export type RectangleInput = {
	min?: VectorLike
	max?: VectorLike
	size?: VectorLike
}

export type RectangleStorageValue = {
	min: VectorStorageValue
	max: VectorStorageValue
}
