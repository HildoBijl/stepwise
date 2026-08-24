import { PrecisionNumber } from '@step-wise/physics-core'
import { asExpression } from '@step-wise/cas'
import { Vector } from '@step-wise/geometry'

import { serialize, serializeAll } from './serialize'
import { deserialize, deserializeAll } from './deserialize'

describe('serialization', () => {
	describe('serialize', () => {
		test('serializes individual objects', () => {
			expect(serialize(new PrecisionNumber('3.140'))).toEqual({ type: 'PrecisionNumber', value: { number: 3.14, significantDigits: 4, power: 0 } })
			expect(serialize(new Vector(1, 2))).toEqual({ type: 'Vector', value: [1, 2] })
			expect(serialize(asExpression('x+2'))).toEqual({ type: 'Expression', value: asExpression('x+2').toStorageValue() })
		})
		test('throws on unknown individual types', () => {
			expect(() => serialize({ type: 'Unknown' } as never)).toThrow()
		})
		test('rejects plain objects as domain values', () => {
			expect(() => serialize({ type: 'PrecisionNumber', number: 2 } as never)).toThrow(/non-plain/)
		})
	})

	describe('deserialize', () => {
		test('deserializes individual objects', () => {
			expect(deserialize({ type: 'PrecisionNumber', value: { number: 3.14, significantDigits: 4, power: 0 } })).toEqual(new PrecisionNumber('3.140'))
			expect(deserialize({ type: 'Vector', value: [1, 2] })).toEqual(new Vector(1, 2))
			const expression = asExpression('x+2')
			expect(deserialize({ type: 'Expression', value: expression.toStorageValue() })).toEqual(expression)
		})
		test('throws on unknown individual types', () => {
			expect(() => deserialize({ type: 'Unknown', value: 3 })).toThrow()
			expect(() => serialize({ type: 'Unknown' } as never)).toThrow()
		})
	})

	describe('serializeAll', () => {
		test('serializes nested data structures', () => {
			const expression = asExpression('x+2')
			const data = {
				a: new Vector(1, 2),
				b: [expression, new PrecisionNumber('2.50')],
				c: 3,
				d: null,
			}
			expect(serializeAll(data)).toEqual({
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
			expect(() => serializeAll(new UnknownSerializable())).toThrow()
		})
		test('rejects values that cannot safely round-trip through JSON', () => {
			expect(() => serializeAll(undefined)).toThrow()
			expect(() => serializeAll(Number.NaN)).toThrow()
			expect(() => serializeAll(Number.POSITIVE_INFINITY)).toThrow()
			expect(() => serializeAll(new Array(1))).toThrow(/sparse/)
		})
		test('rejects circular data while allowing repeated references', () => {
			const circular: { self?: unknown } = {}
			circular.self = circular
			expect(() => serializeAll(circular)).toThrow(/circular/)
			const shared = { value: 1 }
			expect(serializeAll({ first: shared, second: shared })).toEqual({ first: { value: 1 }, second: { value: 1 } })
		})
	})

	describe('deserializeAll', () => {
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
			const result = deserializeAll(data) as typeof data
			expect(result.a).toEqual(new Vector(1, 2))
			expect(result.b[0]).toEqual(expression)
			expect(result.b[1]).toEqual(new PrecisionNumber('2.50'))
			expect(result.c).toBe(3)
			expect(result.d).toBeNull()
		})
		test('leaves plain objects with unknown type untouched during deserializeAll', () => {
			expect(deserializeAll({ type: 'Unknown', value: 3, nested: { a: { type: 'PrecisionNumber', value: { number: 2, significantDigits: Infinity } } } })).toEqual({ type: 'Unknown', value: 3, nested: { a: new PrecisionNumber(2) } })
		})
		test('commits to recognized serialized types', () => {
			expect(() => deserializeAll({ type: 'PrecisionNumber' })).toThrow()
		})
		test('rejects unsafe primitive values and circular data', () => {
			expect(() => deserializeAll(undefined)).toThrow()
			expect(() => deserializeAll(Number.NEGATIVE_INFINITY)).toThrow()
			expect(() => deserializeAll(new Array(1))).toThrow(/sparse/)
			const circular: unknown[] = []
			circular.push(circular)
			expect(() => deserializeAll(circular)).toThrow(/circular/)
			expect(() => deserializeAll({ type: 'Vector', value: circular })).toThrow(/circular/)
		})
	})
})
