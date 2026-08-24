import { PrecisionNumber } from '@step-wise/physics-core'
import { asExpression } from '@step-wise/cas'
import { Vector } from '@step-wise/geometry'

import { serializeData, serializeDomainObject } from './serialize'
import { deserializeData, deserializeDomainObject } from './deserialize'

describe('serialization', () => {
	describe('serializeDomainObject', () => {
		test('serializes individual objects', () => {
			expect(serializeDomainObject(new PrecisionNumber('3.140'))).toEqual({ type: 'PrecisionNumber', value: { number: 3.14, significantDigits: 4, power: 0 } })
			expect(serializeDomainObject(new Vector(1, 2))).toEqual({ type: 'Vector', value: [1, 2] })
			expect(serializeDomainObject(asExpression('x+2'))).toEqual({ type: 'Expression', value: asExpression('x+2').toStorageValue() })
		})
		test('throws on unknown individual types', () => {
			expect(() => serializeDomainObject({ type: 'Unknown' } as never)).toThrow()
		})
		test('rejects plain objects as domain values', () => {
			expect(() => serializeDomainObject({ type: 'PrecisionNumber', number: 2 } as never)).toThrow(/non-plain/)
		})
	})

	describe('deserializeDomainObject', () => {
		test('deserializes individual objects', () => {
			expect(deserializeDomainObject({ type: 'PrecisionNumber', value: { number: 3.14, significantDigits: 4, power: 0 } })).toEqual(new PrecisionNumber('3.140'))
			expect(deserializeDomainObject({ type: 'Vector', value: [1, 2] })).toEqual(new Vector(1, 2))
			const expression = asExpression('x+2')
			expect(deserializeDomainObject({ type: 'Expression', value: expression.toStorageValue() })).toEqual(expression)
		})
		test('throws on unknown individual types', () => {
			expect(() => deserializeDomainObject({ type: 'Unknown', value: 3 })).toThrow()
			expect(() => serializeDomainObject({ type: 'Unknown' } as never)).toThrow()
		})
	})

	describe('serializeData', () => {
		test('serializes nested data structures', () => {
			const expression = asExpression('x+2')
			const data = {
				a: new Vector(1, 2),
				b: [expression, new PrecisionNumber('2.50')],
				c: 3,
				d: null,
			}
			expect(serializeData(data)).toEqual({
				a: { type: 'Vector', value: [1, 2] },
				b: [
					{ type: 'Expression', value: expression.toStorageValue() },
					{ type: 'PrecisionNumber', value: { number: 2.5, significantDigits: 3, power: 0 } },
				],
				c: 3,
				d: null,
			})
		})
		test('throws on non-plain objects with unknown type', () => {
			class UnknownSerializable { readonly type = 'Unknown' }
			expect(() => serializeData(new UnknownSerializable())).toThrow()
		})
		test('rejects values that cannot safely round-trip through JSON', () => {
			expect(() => serializeData(undefined)).toThrow()
			expect(() => serializeData(Number.NaN)).toThrow()
			expect(() => serializeData(Number.POSITIVE_INFINITY)).toThrow()
			expect(() => serializeData(new Array(1))).toThrow(/sparse/)
		})
		test('rejects circular data while allowing repeated references', () => {
			const circular: { self?: unknown } = {}
			circular.self = circular
			expect(() => serializeData(circular)).toThrow(/circular/)
			const shared = { value: 1 }
			expect(serializeData({ first: shared, second: shared })).toEqual({ first: { value: 1 }, second: { value: 1 } })
		})
	})

	describe('deserializeData', () => {
		test('deserializes nested data structures', () => {
			const expression = asExpression('x+2')
			const data = {
				a: { type: 'Vector', value: [1, 2] },
				b: [
					{ type: 'Expression', value: expression.toStorageValue() },
					{ type: 'PrecisionNumber', value: { number: 2.5, significantDigits: 3, power: 0 } },
				],
				c: 3,
				d: null,
			}
			const result = deserializeData(data) as typeof data
			expect(result.a).toEqual(new Vector(1, 2))
			expect(result.b[0]).toEqual(expression)
			expect(result.b[1]).toEqual(new PrecisionNumber('2.50'))
			expect(result.c).toBe(3)
			expect(result.d).toBeNull()
		})
		test('leaves plain objects with unknown type untouched during deserializeData', () => {
			expect(deserializeData({ type: 'Unknown', value: 3, nested: { a: { type: 'PrecisionNumber', value: { number: 2, significantDigits: Infinity } } } })).toEqual({ type: 'Unknown', value: 3, nested: { a: new PrecisionNumber(2) } })
		})
		test('commits to recognized serialized types', () => {
			expect(() => deserializeData({ type: 'PrecisionNumber' })).toThrow()
		})
		test('rejects unsafe primitive values and circular data', () => {
			expect(() => deserializeData(undefined)).toThrow()
			expect(() => deserializeData(Number.NEGATIVE_INFINITY)).toThrow()
			expect(() => deserializeData(new Array(1))).toThrow(/sparse/)
			const circular: unknown[] = []
			circular.push(circular)
			expect(() => deserializeData(circular)).toThrow(/circular/)
			expect(() => deserializeData({ type: 'Vector', value: circular })).toThrow(/circular/)
		})
	})
})
