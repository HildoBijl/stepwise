import type { VectorData, VectorLike } from '../Vector'

export type LineObject = {
	start: VectorLike
	direction: VectorLike
}

export type LineData = {
	start: VectorData
	direction: VectorData
}

export type LineInput = LineObject
