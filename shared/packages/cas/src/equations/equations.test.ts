import { asExpression } from '../expressions'

import { type EquationComparisonSettings } from './comparisonSettings'
import { type EquationLike, Equation, asEquation } from './Equation'

describe('equation interpretation and printing', () => {
	test('interprets equations from strings', () => {
		expectEquationToEqual(asEquation('2x=6'), new Equation(asExpression('2x'), asExpression('6')))
		expectEquationToEqual(asEquation('x+2=5'), new Equation(asExpression('x+2'), asExpression('5')))
	})
})

describe('equation substitution', () => {
	test('substitutes one variable', () => {
		expectEquationToEqual(asEquation('x+2=5').substitute('x', 3), '3+2=5')
	})
	test('substitutes multiple variables by list', () => {
		expectEquationToEqual(asEquation('x+y=5').substitute(['x', 'y'], [2, 3]), '2+3=5')
	})
	test('substitutes multiple variables by object', () => {
		expectEquationToEqual(asEquation('x^2+y=9').substitute({ x: 2, y: 5 }), '2^2+5=9')
	})
})

describe('equation evaluation', () => {
	test('evaluates true equations', () => {
		expect(asEquation('x^2+3=7').evaluateAt(2)).toBe(true)
		expect(asEquation('x+y=5').evaluateAt({ x: 2, y: 3 })).toBe(true)
	})
	test('evaluates false equations', () => {
		expect(asEquation('x^2+3=8').evaluateAt(2)).toBe(false)
	})
	test('throws when variables remain', () => {
		expect(() => asEquation('x+y=5').evaluateAt(2)).toThrow()
	})
})

describe('equation algebraic operations', () => {
	test('applies operations to both sides', () => {
		expectEquationToEqual(asEquation('x=3').add(2), 'x+2=3+2')
		expectEquationToEqual(asEquation('x=3').subtract(2), 'x-2=3-2')
		expectEquationToEqual(asEquation('x=3').multiply(2), 'x*2=3*2')
		expectEquationToEqual(asEquation('x=3').divide(2), 'x/2=3/2')
	})
	test('switches sides and applies minus', () => {
		expectEquationToEqual(asEquation('x=3').switch(), '3=x')
		expectEquationToEqual(asEquation('x=3').applyMinus(), '-x=-3')
	})
})

describe('equation simplification presets', () => {
	test('simplifies both sides', () => {
		expectEquationToEqual(asEquation('x+0=2+3').removeTrivial(), 'x=2+3')
		expectEquationToEqual(asEquation('x+0=2+3').mergeNumbers(), 'x+0=5')
		expectEquationToEqual(asEquation('x-x=2*3').cancel(), '0=6')
	})
	test('normalizes both sides', () => {
		expectEquationToEqual(asEquation('2x+3x=10+5').normalize(), '5x=15')
	})
	test('moves all terms to the left', () => {
		expectEquationToEqual(asEquation('2*3=x+x').moveAllToLeft(), '2*3-(x+x)=0')
		expectEquationToEqual(asEquation('2*3=x+x').normalizeToZero(), '-2x+6=0')
	})
})

describe('equation property checks', () => {
	test('checks dependencies', () => {
		expect(asEquation('x+2=5').dependsOn('x')).toBe(true)
		expect(asEquation('x+2=5').dependsOn('y')).toBe(false)
	})
	test('checks numeric status', () => {
		expect(asEquation('2+3=5').isNumeric()).toBe(true)
		expect(asEquation('x+3=5').isNumeric()).toBe(false)
	})
	test('extracts variables', () => {
		expect(asEquation('x+y=5').getVariables().map(variable => variable.str)).toEqual(['x', 'y'])
	})
})

describe('equation structure checks', () => {
	test('detects fractions and powers', () => {
		expect(asEquation('x/2=3').hasFraction()).toBe(true)
		expect(asEquation('x^2=4').hasPower()).toBe(true)
		expect(asEquation('x=3').hasFraction()).toBe(false)
	})
	test('detects similar terms', () => {
		expect(asEquation('2x+3x=5').hasSimilarTerms()).toBe(true)
		expect(asEquation('2x+y=5').hasSimilarTerms()).toBe(false)
	})
})

describe('equation equality and equivalence', () => {
	test('checks structural equality', () => {
		expect(asEquation('x+2=5').equalStructure('x+2=5')).toBe(true)
		expect(asEquation('x+2=5').equalStructure('5=2+x')).toBe(true)
		expect(asEquation('x+2=5').strictEqualStructure('5=x+2')).toBe(false)
	})
	test('detects equivalent equations', () => {
		expect(asEquation('2*x=6').equivalent('4*x=12')).toBe(true)
		expect(asEquation('2*x=6').equivalent('2*x-6=0')).toBe(true)
		expect(asEquation('2*x=6').equivalent('4*x-12=0')).toBe(true)
	})
	test('detects non-equivalent equations', () => {
		expect(asEquation('2*x=6').equivalent('2*x=8')).toBe(false)
		expect(asEquation('2*x=6').equivalent('2*x^2=6*x')).toBe(false)
		expect(asEquation('2*x=6').equivalent('4*x*y-12*y=0')).toBe(false)
	})
})

export function expectEquationToEqual(result: EquationLike, expected: EquationLike, comparisonSettings: Partial<EquationComparisonSettings> = {}) {
	const resultValue = asEquation(result)
	const expectedValue = asEquation(expected)
	if (!expectedValue.strictEqualStructure(resultValue, comparisonSettings)) throw new Error(`An equation was not what was expected.
	Actual output:   ${resultValue.str}
	Expected output: ${expectedValue.str}
	Actual output structure:   ${resultValue.tree}
	Expected output structure: ${expectedValue.tree}`)
}
