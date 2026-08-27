import { equationChecks } from './checks'

describe('equationChecks', () => {
	test('detects structures on either side', () => {
		expect(equationChecks.hasSumWithinProduct('2*(x+1)=0')).toBe(true)
		expect(equationChecks.hasSumWithinFraction('0=(x+1)/y')).toBe(true)
		expect(equationChecks.hasFraction('x/y=0')).toBe(true)
		expect(equationChecks.hasFractionWithinFraction('0=(x/y)/z')).toBe(true)
		expect(equationChecks.hasVariableInDenominator('0=1/(x+1)', 'x')).toBe(true)
		expect(equationChecks.hasPower('0=x^2')).toBe(true)
	})

	test('passes semantic callbacks to expression checks', () => {
		expect(equationChecks.hasFractionSatisfying('(x+1)/y=0', fraction => fraction.numerator.isSum())).toBe(true)
		expect(equationChecks.hasFractionSatisfying('x/y=0', fraction => fraction.numerator.isSum())).toBe(false)
	})
})
