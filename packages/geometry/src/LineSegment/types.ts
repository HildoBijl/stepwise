import type { VectorData, VectorLike } from '../Vector'

export type LineSegmentObject = {
	start?: VectorLike
	end?: VectorLike
	vector?: VectorLike
}

export type LineSegmentData = {
	start: VectorData
	end: VectorData
}

export type LineSegmentInput = LineSegmentObject
