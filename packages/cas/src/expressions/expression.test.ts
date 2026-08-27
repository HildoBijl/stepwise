import { identity } from '@step-wise/js-utils'

import { sum, variable } from '../core'
import { expectExpressionToEqual } from '../tests/support/wrapperAssertions'

import { Expression, asExpression } from './Expression'

describe('Expression', () => {
	test('coerces strings and numbers', () => {
		expectExpressionToEqual(asExpression('x+2'), 'x+2')
		expect(asExpression(3).value).toBe(3)
	})

	test('exposes type-specific parts', () => {
		const fraction = asExpression('(-x)/y')
		expect(fraction.numerator.str).toBe('-x')
		expect(fraction.denominator.str).toBe('y')
		expect(asExpression('x^2').base.str).toBe('x')
		expect(asExpression('x^2').exponent.str).toBe('2')
	})

	test('preserves special function representations for identity maps', () => {
		const logarithm = asExpression('ln(x)')
		const squareRoot = asExpression('sqrt(x)')
		expect(logarithm.mapBase(identity)).toBe(logarithm)
		expect(squareRoot.mapDegree(identity)).toBe(squareRoot)
		expectExpressionToEqual(logarithm.mapBase(() => asExpression(10)), 'log[10](x)')
		expectExpressionToEqual(squareRoot.mapDegree(() => asExpression(3)), 'root[3](x)')
	})

	test('supports signs around fractions', () => {
		expectExpressionToEqual(asExpression('±(x/y)').invert(), '±(y/x)')
		expectExpressionToEqual(asExpression('-(x/y)').invert(), '-(y/x)')
	})

	test('substitutes variables simultaneously without dummy collisions', () => {
		expectExpressionToEqual(asExpression('x+y').substitute(['x', 'y'], ['y', 'z']), 'y+z')
		expectExpressionToEqual(asExpression('x+y').substitute({ x: 2, y: 3 }), '2+3')
		const reservedVariable = variable('TemporaryDummyVariable', 'index0')
		const result = new Expression(sum(reservedVariable, 'x')).substitute(['x'], ['y'])
		expect(result.terms[0].strictEqualStructure(new Expression(reservedVariable))).toBe(true)
		expect(result.terms[1].str).toBe('y')
	})

	test('evaluates substitutions and rejects remaining variables', () => {
		expect(asExpression('x^2+3*y').evaluateAt({ x: 2, y: 5 })).toBe(19)
		expect(asExpression('x^2+3').evaluateAt(2)).toBe(7)
		expect(() => asExpression('x+y').evaluateAt(2)).toThrow()
	})

	test('converts mapped expressions back to the original settings', () => {
		const expression = asExpression('x', undefined, { angleUnit: 'degrees' })
		const mapped = expression.mapExpressions(() => asExpression('sin(x)', undefined, { angleUnit: 'radians' }))
		expect(mapped.settings.angleUnit).toBe('degrees')
		expect(mapped.strictEqualStructure(asExpression('sin(x*180/π)', undefined, { angleUnit: 'degrees' }))).toBe(true)
	})

	test('runs recursive visitors in the requested order', () => {
		const parentFirst: string[] = []
		const childrenFirst: string[] = []
		asExpression('x+1').forEachExpression(child => parentFirst.push(child.subtype))
		asExpression('x+1').forEachExpression(child => childrenFirst.push(child.subtype), { childrenFirst: true })
		expect(parentFirst).toEqual(['Sum', 'Variable', 'Integer'])
		expect(childrenFirst).toEqual(['Variable', 'Integer', 'Sum'])
	})

	test('applies simplification and differentiation wrappers', () => {
		expectExpressionToEqual(asExpression('x+0').removeTrivial(), 'x')
		expectExpressionToEqual(asExpression('2+x+3').mergeNumbers(), 'x+5')
		expectExpressionToEqual(asExpression('(x*y)/x').cancel(), 'y')
		expectExpressionToEqual(asExpression('x^2+3*x').differentiate('x'), '2*x^(2-1)+3')
	})
})
