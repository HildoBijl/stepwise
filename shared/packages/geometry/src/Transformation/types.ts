import type { VectorData, VectorLike } from '../Vector'
import type { LineLike } from '../Line'
import type { LineSegmentLike } from '../LineSegment'
import type { RectangleLike } from '../Rectangle'
import type { MatrixData, MatrixLike } from '../Matrix'

export type TransformationData = {
	matrix: MatrixData,
	translation: VectorData,
}

export type TransformationDescription = {
	matrix: MatrixLike
	translation?: VectorLike
}

export type TransformationInput = MatrixLike | TransformationDescription

export type TransformableLike = VectorLike | LineLike | LineSegmentLike | RectangleLike
