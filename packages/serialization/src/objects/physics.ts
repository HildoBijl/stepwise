import { type PrecisionNumber as PrecisionNumberType, type SerializedPrecisionNumber, serializePrecisionNumber, deserializePrecisionNumber } from '@step-wise/physics-core'
import { type Unit as UnitType, type SerializedUnit, serializeUnit, deserializeUnit } from '@step-wise/physics-core'
import { type FloatUnit as FloatUnitType, type SerializedFloatUnit, serializeFloatUnit, deserializeFloatUnit } from '@step-wise/physics-core'

import type { SerializerEntry } from '../types'

export const PrecisionNumber = {
	serialize: serializePrecisionNumber,
	deserialize: deserializePrecisionNumber,
} satisfies SerializerEntry<PrecisionNumberType, SerializedPrecisionNumber>

export const Unit = {
	serialize: serializeUnit,
	deserialize: deserializeUnit,
} satisfies SerializerEntry<UnitType, SerializedUnit>

export const FloatUnit = {
	serialize: serializeFloatUnit,
	deserialize: deserializeFloatUnit,
} satisfies SerializerEntry<FloatUnitType, SerializedFloatUnit>
