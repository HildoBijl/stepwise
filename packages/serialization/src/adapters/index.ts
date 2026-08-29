import type { AnySerializationAdapter, SerializationAdapters } from '../types.ts'

import { EquationType, ExpressionType } from '@step-wise/cas'
import { LineSegmentType, LineType, RectangleType, VectorType } from '@step-wise/geometry'
import { PrecisionNumberType, QuantityType, UnitType } from '@step-wise/physics-core'

import { equationAdapter, expressionAdapter } from './cas.ts'
import { lineAdapter, lineSegmentAdapter, rectangleAdapter, vectorAdapter } from './geometry.ts'
import { precisionNumberAdapter, quantityAdapter, unitAdapter } from './physics.ts'

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
} satisfies SerializationAdapters

export function getSerializationAdapter(type: string): AnySerializationAdapter | undefined {
	return Object.hasOwn(serializationAdapters, type) ? serializationAdapters[type as keyof typeof serializationAdapters] : undefined
}
