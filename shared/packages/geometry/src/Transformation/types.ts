import type { VectorData, VectorLike } from '../Vector'
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
