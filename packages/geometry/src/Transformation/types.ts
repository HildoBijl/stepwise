import type { VectorLike, VectorStorageValue } from '../Vector'
import type { LineLike } from '../Line'
import type { LineSegmentLike } from '../LineSegment'
import type { RectangleLike } from '../Rectangle'
import type { MatrixLike, MatrixStorageValue } from '../Matrix'

export type TransformationStorageValue = {
	matrix: MatrixStorageValue
	translation: VectorStorageValue
}

export type TransformationObjectInput = {
	matrix: MatrixLike
	translation?: VectorLike
}

export type TransformationInput = MatrixLike | TransformationObjectInput

export type TransformableLike = VectorLike | LineLike | LineSegmentLike | RectangleLike
