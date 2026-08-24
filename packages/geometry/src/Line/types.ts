import type { VectorLike, VectorStorageValue } from '../Vector'

export type LineInput = {
	start: VectorLike
	direction: VectorLike
}

export type LineStorageValue = {
	start: VectorStorageValue
	direction: VectorStorageValue
}
