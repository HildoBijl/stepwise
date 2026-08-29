import { type SerializedPrecisionNumber, PrecisionNumber, isSerializedPrecisionNumber, serializePrecisionNumber } from '@step-wise/physics-core'
import { type SerializedUnit, Unit, isSerializedUnit, serializeUnit } from '@step-wise/physics-core'
import { type SerializedQuantity, Quantity, isSerializedQuantity, serializeQuantity } from '@step-wise/physics-core'

import type { SerializationAdapter } from '../types.ts'

export const precisionNumberAdapter = {
	isDomainValue: (value: unknown): value is PrecisionNumber => value instanceof PrecisionNumber,
	isSerializedValue: isSerializedPrecisionNumber,
	serialize: serializePrecisionNumber,
	deserialize: serializedValue => new PrecisionNumber(serializedValue.value),
} satisfies SerializationAdapter<PrecisionNumber, SerializedPrecisionNumber>

export const unitAdapter = {
	isDomainValue: (value: unknown): value is Unit => value instanceof Unit,
	isSerializedValue: isSerializedUnit,
	serialize: serializeUnit,
	deserialize: serializedValue => new Unit(serializedValue.value),
} satisfies SerializationAdapter<Unit, SerializedUnit>

export const quantityAdapter = {
	isDomainValue: (value: unknown): value is Quantity => value instanceof Quantity,
	isSerializedValue: isSerializedQuantity,
	serialize: serializeQuantity,
	deserialize: serializedValue => new Quantity(serializedValue.value),
} satisfies SerializationAdapter<Quantity, SerializedQuantity>
