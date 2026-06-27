import { Float } from '@step-wise/physics-core'
import { asExpression } from '@step-wise/cas'
import { Vector } from '@step-wise/geometry'

import { serialize, serializeAll } from './serialize'
import { deserialize, deserializeAll } from './deserialize'

describe('serialization', () => {
	describe('serialize', () => {
		test('serializes individual objects', () => {
			expect(serialize(new Float('3.140'))).toEqual({ type: 'Float', value: { number: 3.14, significantDigits: 4, power: 0 } })
			expect(serialize(new Vector(1, 2))).toEqual({ type: 'Vector', value: [1, 2] })
			expect(serialize(asExpression('x+2'))).toEqual({ type: 'Expression', value: asExpression('x+2').toStorageValue() })
		})
		test('throws on unknown individual types', () => {
			expect(() => serialize({ type: 'Unknown' } as never)).toThrow()
		})
	})

	describe('deserialize', () => {
		test('deserializes individual objects', () => {
			expect(deserialize({ type: 'Float', value: { number: 3.14, significantDigits: 4, power: 0 } })).toEqual(new Float('3.140'))
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
				b: [expression, new Float('2.50')],
				c: 3,
				d: null,
			}
			expect(serializeAll(data)).toEqual({
				a: { type: 'Vector', value: [1, 2] },
				b: [
					{ type: 'Expression', value: expression.toStorageValue() },
					{ type: 'Float', value: { number: 2.5, significantDigits: 3, power: 0 } },
				],
				c: 3,
				d: null,
			})
		})
		test('throws on non-plain objects with unknown type', () => {
			class UnknownSerializable { readonly type = 'Unknown' }
			expect(() => deserializeAll(new UnknownSerializable())).toThrow()
		})
	})

	describe('deserializeAll', () => {
		test('deserializes nested data structures', () => {
			const expression = asExpression('x+2')
			const data = {
				a: { type: 'Vector', value: [1, 2] },
				b: [
					{ type: 'Expression', value: expression.toStorageValue() },
					{ type: 'Float', value: { number: 2.5, significantDigits: 3, power: 0 } },
				],
				c: 3,
				d: null,
			}
			const result = deserializeAll(data) as typeof data
			expect(result.a).toEqual(new Vector(1, 2))
			expect(result.b[0]).toEqual(expression)
			expect(result.b[1]).toEqual(new Float('2.50'))
			expect(result.c).toBe(3)
			expect(result.d).toBeNull()
		})
		test('leaves plain objects with unknown type untouched during deserializeAll', () => {
			expect(deserializeAll({ type: 'Unknown', value: 3, nested: { a: { type: 'Float', value: { number: 2, significantDigits: Infinity } } } })).toEqual({ type: 'Unknown', value: 3, nested: { a: new Float(2) } })
		})
	})
})
