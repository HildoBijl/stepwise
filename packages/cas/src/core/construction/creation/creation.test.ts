import { Float, Integer, Product, Sum, Variable } from '../nodes'

import { asExpressionNode } from './asExpressionNode'
import { fraction, power } from './functions'
import { product, sum } from './lists'
import { number } from './numbers'

describe('expression-node creation', () => {
	test('coerces primitive inputs', () => {
		expect(asExpressionNode('x')).toBeInstanceOf(Variable)
		expect(asExpressionNode(2)).toBeInstanceOf(Integer)
		expect(number(2.5)).toBeInstanceOf(Float)
	})

	test('uses canonical empty and single-item list results', () => {
		expect(sum()).toBe(Integer.zero)
		expect(product()).toBe(Integer.one)
		expect(sum('x')).toBeInstanceOf(Variable)
		expect(product('x')).toBeInstanceOf(Variable)
	})

	test('constructs lists and functions from primitive inputs', () => {
		expect(sum('x', 1)).toBeInstanceOf(Sum)
		expect(product('x', 2)).toBeInstanceOf(Product)
		expect(fraction('x', 2).numerator).toBeInstanceOf(Variable)
		expect(power('x', 2).exponent).toBeInstanceOf(Integer)
	})

	test('rejects unsupported inputs', () => {
		expect(() => asExpressionNode(null as never)).toThrow('Invalid expression node input')
	})
})
