import { expressionChecks } from './checks'

describe('expressionChecks', () => {
	test('checks expression properties', () => {
		expect(expressionChecks.isInteger(2)).toBe(true)
		expect(expressionChecks.isPolynomial('x^2+1')).toBe(true)
		expect(expressionChecks.isRational('x/(x+1)')).toBe(true)
		expect(expressionChecks.isFractionLike('-(x/y)')).toBe(true)
	})

	test('finds relevant nested structures', () => {
		expect(expressionChecks.hasUnmergedProductNumbers('2*3*x')).toBe(true)
		expect(expressionChecks.hasSumWithinMinus('-(x+1)')).toBe(true)
		expect(expressionChecks.hasSumWithinProduct('2*(x+1)')).toBe(true)
		expect(expressionChecks.hasSumWithinFraction('(x+1)/y')).toBe(true)
		expect(expressionChecks.hasFractionWithinFraction('(x/y)/z')).toBe(true)
		expect(expressionChecks.hasVariableInDenominator('1/(x+1)', 'x')).toBe(true)
		expect(expressionChecks.hasSumWithinPowerBase('(x+1)^2')).toBe(true)
		expect(expressionChecks.hasProductWithinPowerBase('(x*y)^2')).toBe(true)
		expect(expressionChecks.hasPowerWithinPowerBase('(x^2)^3')).toBe(true)
		expect(expressionChecks.hasNegativeExponent('x^(-2)')).toBe(true)
	})

	test('honors includeSelf and semantic callbacks', () => {
		expect(expressionChecks.hasFraction('x/y')).toBe(true)
		expect(expressionChecks.hasFraction('x/y', { includeSelf: false })).toBe(false)
		expect(expressionChecks.hasPower('x^2', { includeSelf: false })).toBe(false)
		expect(expressionChecks.hasFractionSatisfying('(x+1)/y', fraction => fraction.numerator.isSum())).toBe(true)
		expect(expressionChecks.hasSimilarTerms('x+2*x')).toBe(true)
		expect(expressionChecks.hasSimilarTerms('x+y')).toBe(false)
	})
})
