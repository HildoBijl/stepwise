import { EquationType, ExpressionType } from '@step-wise/cas'
import { LineSegmentType, LineType, RectangleType, VectorType } from '@step-wise/geometry'
import { PrecisionNumberType, QuantityType, UnitType } from '@step-wise/physics-core'

import { Equation, Expression } from './cas'
import { Line, LineSegment, Rectangle, Vector } from './geometry'
import { PrecisionNumber, Quantity, Unit } from './physics'

export const serializers = {
	[ExpressionType]: Expression,
	[EquationType]: Equation,

	[VectorType]: Vector,
	[LineType]: Line,
	[LineSegmentType]: LineSegment,
	[RectangleType]: Rectangle,
	
	[PrecisionNumberType]: PrecisionNumber,
	[UnitType]: Unit,
	[QuantityType]: Quantity,
}
