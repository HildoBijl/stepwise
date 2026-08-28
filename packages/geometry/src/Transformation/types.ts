import type { VectorLike, VectorStorageValue } from '../Vector/index.ts'
import type { LineLike } from '../Line/index.ts'
import type { LineSegmentLike } from '../LineSegment/index.ts'
import type { RectangleLike } from '../Rectangle/index.ts'
import type { MatrixLike, MatrixStorageValue } from '../Matrix/index.ts'

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
