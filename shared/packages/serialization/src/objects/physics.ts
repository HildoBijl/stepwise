import { type Float as FloatType, type SerializedFloat, serializeFloat, deserializeFloat } from '@step-wise/physics-core'
import { type Unit as UnitType, type SerializedUnit, serializeUnit, deserializeUnit } from '@step-wise/physics-core'
import { type FloatUnit as FloatUnitType, type SerializedFloatUnit, serializeFloatUnit, deserializeFloatUnit } from '@step-wise/physics-core'

import type { SerializerEntry } from '../types'

export const Float = {
	serialize: serializeFloat,
	deserialize: deserializeFloat,
} satisfies SerializerEntry<FloatType, SerializedFloat>

export const Unit = {
	serialize: serializeUnit,
	deserialize: deserializeUnit,
} satisfies SerializerEntry<UnitType, SerializedUnit>

export const FloatUnit = {
	serialize: serializeFloatUnit,
	deserialize: deserializeFloatUnit,
} satisfies SerializerEntry<FloatUnitType, SerializedFloatUnit>
