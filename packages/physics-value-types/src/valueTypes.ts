import type { ValueTypes } from '@step-wise/value-types'

import { PrecisionNumberType, precisionNumberValueType } from './precisionNumber.ts'
import { UnitType, unitValueType } from './unit.ts'
import { QuantityType, quantityValueType } from './quantity.ts'

export const physicsValueTypes = {
	[PrecisionNumberType]: precisionNumberValueType,
	[UnitType]: unitValueType,
	[QuantityType]: quantityValueType,
} satisfies ValueTypes
