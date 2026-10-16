import type { VectorLike, VectorStorageValue } from '../Vector/index.ts'

export type LineSegmentEndpoints = readonly [VectorLike, VectorLike]

export type LineSegmentObject = {
	start?: VectorLike
	end?: VectorLike
	vector?: VectorLike
}

export type LineSegmentInput = LineSegmentEndpoints | LineSegmentObject

export type LineSegmentStorageValue = {
	start: VectorStorageValue
	end: VectorStorageValue
}
