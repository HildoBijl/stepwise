import type { VectorLike, VectorStorageValue } from '../Vector/index.ts'

export type RectangleInput = {
	min?: VectorLike
	max?: VectorLike
	size?: VectorLike
}

export type RectangleStorageValue = {
	min: VectorStorageValue
	max: VectorStorageValue
}
