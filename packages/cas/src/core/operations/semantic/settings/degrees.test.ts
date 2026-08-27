import { arcsin, namedConstants, product, fraction, sin, sum } from '../../../construction'
import { areNodesEqual } from '../../structural'

import { convertExpressionToDegrees, convertExpressionToRadians } from './degrees'

describe('angle-unit conversion', () => {
	test('converts direct and nested trigonometric functions to radians', () => {
		const input = sum(sin('x'), arcsin('y'))
		const expected = sum(sin(product('x', fraction(namedConstants.pi, 180))), product(arcsin('y'), fraction(180, namedConstants.pi)))
		expect(areNodesEqual(convertExpressionToRadians(input), expected, false)).toBe(true)
	})

	test('converts trigonometric functions to degrees', () => {
		const expected = sin(product('x', fraction(180, namedConstants.pi)))
		expect(areNodesEqual(convertExpressionToDegrees(sin('x')), expected, false)).toBe(true)
	})

	test('reuses expressions without trigonometry', () => {
		const input = sum('x', 1)
		expect(convertExpressionToRadians(input)).toBe(input)
	})
})
