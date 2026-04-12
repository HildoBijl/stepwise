import type { VectorData, VectorLike } from '../Vector'

export type RectangleObject = {
	start: VectorLike
	end: VectorLike
}

export type RectangleTuple = [VectorLike, VectorLike]

export type RectangleData = {
	min: VectorData
	max: VectorData
}

export type RectangleInput = RectangleObject | RectangleTuple
