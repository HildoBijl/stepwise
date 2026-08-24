import type { VectorLike, VectorStorageValue } from '../Vector'

export type LineSegmentInput = {
	start?: VectorLike
	end?: VectorLike
	vector?: VectorLike
}

export type LineSegmentStorageValue = {
	start: VectorStorageValue
	end: VectorStorageValue
}
