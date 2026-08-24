import { EquationType, ExpressionType } from '@step-wise/cas'
import { LineSegmentType, LineType, RectangleType, VectorType } from '@step-wise/geometry'
import { PrecisionNumberType, QuantityType, UnitType } from '@step-wise/physics-core'

import { equationAdapter, expressionAdapter } from './cas'
import { lineAdapter, lineSegmentAdapter, rectangleAdapter, vectorAdapter } from './geometry'
import { precisionNumberAdapter, quantityAdapter, unitAdapter } from './physics'

export const serializationAdapters = {
	[ExpressionType]: expressionAdapter,
	[EquationType]: equationAdapter,

	[VectorType]: vectorAdapter,
	[LineType]: lineAdapter,
	[LineSegmentType]: lineSegmentAdapter,
	[RectangleType]: rectangleAdapter,

	[PrecisionNumberType]: precisionNumberAdapter,
	[UnitType]: unitAdapter,
	[QuantityType]: quantityAdapter,
}
