import { type PrecisionNumber as PrecisionNumberType, type SerializedPrecisionNumber, serializePrecisionNumber, deserializePrecisionNumber } from '@step-wise/physics-core'
import { type Unit as UnitType, type SerializedUnit, serializeUnit, deserializeUnit } from '@step-wise/physics-core'
import { type Quantity as QuantityType, type SerializedQuantity, serializeQuantity, deserializeQuantity } from '@step-wise/physics-core'

import type { SerializationAdapter } from '../types'

export const precisionNumberAdapter = {
	serialize: serializePrecisionNumber,
	deserialize: deserializePrecisionNumber,
} satisfies SerializationAdapter<PrecisionNumberType, SerializedPrecisionNumber>

export const unitAdapter = {
	serialize: serializeUnit,
	deserialize: deserializeUnit,
} satisfies SerializationAdapter<UnitType, SerializedUnit>

export const quantityAdapter = {
	serialize: serializeQuantity,
	deserialize: deserializeQuantity,
} satisfies SerializationAdapter<QuantityType, SerializedQuantity>
