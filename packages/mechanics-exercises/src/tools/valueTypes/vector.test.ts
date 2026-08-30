import { describe, expect, it } from 'vitest'

import { Vector, VectorType } from '@step-wise/geometry'

import { vectorSerializationAdapter } from './vector.ts'

describe('Vector value type', () => {
	it('serializes and deserializes vectors', () => {
		const vector = new Vector(2, 3)
		const serialized = vectorSerializationAdapter.serialize(vector)
		const restored = vectorSerializationAdapter.deserialize(serialized)

		expect(serialized.type).toBe(VectorType)
		expect(vectorSerializationAdapter.isSerializedValue(serialized)).toBe(true)
		expect(restored).toEqual(vector)
	})

	it('only identifies vectors as domain values', () => {
		expect(vectorSerializationAdapter.isDomainValue(new Vector(1, 2))).toBe(true)
		expect(vectorSerializationAdapter.isDomainValue([1, 2])).toBe(false)
	})
})
