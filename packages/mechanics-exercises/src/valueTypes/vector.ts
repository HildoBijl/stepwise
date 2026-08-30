import { type SerializedVector, Vector, VectorType, deserializeVector, isSerializedVector, serializeVector } from '@step-wise/geometry'
import type { SerializationAdapter } from '@step-wise/serialization'
import type { ValueType } from '@step-wise/value-types'

export const vectorSerializationAdapter = {
	isDomainValue: (value: unknown): value is Vector => value instanceof Vector,
	isSerializedValue: isSerializedVector,
	serialize: serializeVector,
	deserialize: deserializeVector,
} satisfies SerializationAdapter<Vector, SerializedVector>

export const vectorValueType = {
	serialization: vectorSerializationAdapter,
} satisfies ValueType

export { VectorType }
