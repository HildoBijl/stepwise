import type { VectorData, VectorLike } from '../Vector'

export type LineSegmentObject = {
	start?: VectorLike
	vector?: VectorLike
	end?: VectorLike
}

export type LineSegmentData = {
	start: VectorData
	end: VectorData
}

export type LineSegmentInput = LineSegmentObject
