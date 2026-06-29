import { Float } from '@step-wise/physics-core'
import { asExpression } from '@step-wise/cas'
import { Vector } from '@step-wise/geometry'

import { interpretInputValue, interpretAllInputValues } from './interpret'
import { toInputValue } from './toInputValue'

describe('input interpretation', () => {
	describe('interpretInputValue', () => {
		test('interprets individual input values', () => {
			expect(interpretInputValue({ type: 'Integer', value: '42' })).toBe(42)
			expect(interpretInputValue({ type: 'MultipleChoice', value: [2, 4, 1] })).toEqual([2, 4, 1])
			expect(interpretInputValue({ type: 'Float', value: { number: '3.140' } })).toEqual(new Float('3.140'))
			expect(interpretInputValue({ type: 'Vector', value: [1, 2] })).toEqual(new Vector(1, 2))
			expect(interpretInputValue({ type: 'Expression', value: [{ type: 'ExpressionPart', value: 'x+2' }] })).toEqual(asExpression('x+2'))
		})
		test('throws on unknown individual types', () => {
			expect(() => interpretInputValue({ type: 'Unknown', value: 3 })).toThrow()
		})
	})

	describe('toInputValue', () => {
		test('converts individual domain values to input values', () => {
			expect(toInputValue(42, 'Integer')).toEqual({ type: 'Integer', value: '42' })
			expect(toInputValue([2, 4, 1], 'MultipleChoice')).toEqual({ type: 'MultipleChoice', value: [2, 4, 1] })
			expect(toInputValue(new Vector(1, 2), 'Vector')).toEqual({ type: 'Vector', value: [1, 2] })
			expect(toInputValue(new Float('3.140'), 'Float')).toEqual({ type: 'Float', value: { number: '3.140' } })
			expect(toInputValue(asExpression('x+2'), 'Expression')).toEqual({ type: 'Expression', value: [{ type: 'ExpressionPart', value: 'x+2' }] })
		})
		test('throws on unknown types', () => {
			expect(() => toInputValue(3, 'Unknown')).toThrow()
		})
	})

	describe('interpretAllInputValues', () => {
		test('interprets nested data structures', () => {
			const data = {
				a: { type: 'Vector', value: [1, 2] },
				b: [
					{ type: 'Expression', value: [{ type: 'ExpressionPart', value: 'x+2' }] },
					{ type: 'Float', value: { number: '2.50' } },
				],
				c: { type: 'Integer', value: '3' },
				d: null,
			}
			const result = interpretAllInputValues(data) as any
			expect(result.a).toEqual(new Vector(1, 2))
			expect(result.b[0]).toEqual(asExpression('x+2'))
			expect(result.b[1]).toEqual(new Float('2.50'))
			expect(result.c).toBe(3)
			expect(result.d).toBeNull()
		})
		test('leaves plain objects with unknown type untouched during interpretAllInputValues', () => {
			expect(interpretAllInputValues({
				type: 'Unknown',
				value: 3,
				nested: { a: { type: 'Integer', value: '2' } },
			})).toEqual({
				type: 'Unknown',
				value: 3,
				nested: { a: 2 },
			})
		})
	})
})
