import { type PrecisionNumber as PrecisionNumberType, type SerializedPrecisionNumber, serializePrecisionNumber, deserializePrecisionNumber } from '@step-wise/physics-core'
import { type Unit as UnitType, type SerializedUnit, serializeUnit, deserializeUnit } from '@step-wise/physics-core'
import { type Quantity as QuantityType, type SerializedQuantity, serializeQuantity, deserializeQuantity } from '@step-wise/physics-core'

import type { SerializerEntry } from '../types'

export const PrecisionNumber = {
	serialize: serializePrecisionNumber,
	deserialize: deserializePrecisionNumber,
} satisfies SerializerEntry<PrecisionNumberType, SerializedPrecisionNumber>

export const Unit = {
	serialize: serializeUnit,
	deserialize: deserializeUnit,
} satisfies SerializerEntry<UnitType, SerializedUnit>

export const Quantity = {
	serialize: serializeQuantity,
	deserialize: deserializeQuantity,
} satisfies SerializerEntry<QuantityType, SerializedQuantity>
