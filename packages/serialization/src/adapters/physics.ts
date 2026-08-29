import { PrecisionNumber, type SerializedPrecisionNumber, isSerializedPrecisionNumber, serializePrecisionNumber, deserializePrecisionNumber } from '@step-wise/physics-core'
import { Unit, type SerializedUnit, isSerializedUnit, serializeUnit, deserializeUnit } from '@step-wise/physics-core'
import { Quantity, type SerializedQuantity, isSerializedQuantity, serializeQuantity, deserializeQuantity } from '@step-wise/physics-core'

import type { SerializationAdapter } from '../types.ts'

export const precisionNumberAdapter = {
	isDomainValue: (value: unknown): value is PrecisionNumber => value instanceof PrecisionNumber,
	isSerializedValue: isSerializedPrecisionNumber,
	serialize: serializePrecisionNumber,
	deserialize: deserializePrecisionNumber,
} satisfies SerializationAdapter<PrecisionNumber, SerializedPrecisionNumber>

export const unitAdapter = {
	isDomainValue: (value: unknown): value is Unit => value instanceof Unit,
	isSerializedValue: isSerializedUnit,
	serialize: serializeUnit,
	deserialize: deserializeUnit,
} satisfies SerializationAdapter<Unit, SerializedUnit>

export const quantityAdapter = {
	isDomainValue: (value: unknown): value is Quantity => value instanceof Quantity,
	isSerializedValue: isSerializedQuantity,
	serialize: serializeQuantity,
	deserialize: deserializeQuantity,
} satisfies SerializationAdapter<Quantity, SerializedQuantity>
