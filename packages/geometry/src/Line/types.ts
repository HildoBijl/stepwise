import type { VectorLike, VectorStorageValue } from '../Vector/index.ts'

export type LineInput = {
	start: VectorLike
	direction: VectorLike
}

export type LineStorageValue = {
	start: VectorStorageValue
	direction: VectorStorageValue
}
