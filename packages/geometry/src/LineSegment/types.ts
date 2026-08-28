import type { VectorLike, VectorStorageValue } from '../Vector/index.ts'

export type LineSegmentInput = {
	start?: VectorLike
	end?: VectorLike
	vector?: VectorLike
}

export type LineSegmentStorageValue = {
	start: VectorStorageValue
	end: VectorStorageValue
}
