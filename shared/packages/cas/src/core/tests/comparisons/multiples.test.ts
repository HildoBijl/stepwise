import { Integer, namedConstants, variable, sum, product, power } from '../../construction'
import { isConstantMultiple, isIntegerMultiple } from '../../operations'

const x = variable('x')
const y = variable('y')

describe('multiple comparisons', () => {
	test('detects integer multiples', () => {
		expect(isIntegerMultiple(product(6, x), product(2, x))).toBe(true)
		expect(isIntegerMultiple(product(-6, x), product(2, x))).toBe(true)
		expect(isIntegerMultiple(sum(product(6, power(x, 2), product(9, x), 3)), sum(product(2, power(x, 2), product(3, x), 1)))).toBe(true)
		// expect(isIntegerMultiple(sum(product(6, x), product(9, y)), sum(product(2, x), product(3, y)))).toBe(true) // ToDo: Add this when multi-variable polynomials are implemented.
	})

	test('rejects non-integer multiples', () => {
		expect(isIntegerMultiple(product(3, x), product(2, x))).toBe(false)
		expect(isIntegerMultiple(product(namedConstants.pi, x), x)).toBe(false)
		expect(isIntegerMultiple(power(x, 2), x)).toBe(false)
		expect(isIntegerMultiple(sum(product(6, power(x, 2), product(9, x), 3)), sum(product(4, power(x, 2), product(6, x), 2)))).toBe(false)
	})

	test('detects constant multiples', () => {
		expect(isConstantMultiple(product(3, x), product(2, x))).toBe(true)
		expect(isConstantMultiple(product(namedConstants.pi, x), x)).toBe(true)
		expect(isConstantMultiple(sum(product(6, power(x, 2), product(9, x), 3)), sum(product(4, power(x, 2), product(6, x), 2)))).toBe(true)
		// expect(isConstantMultiple(sum(product(6, x), product(9, y)), sum(product(4, x), product(6, y)))).toBe(true) // ToDo: Add this when multi-variable polynomials are implemented.
	})

	test('rejects non-constant multiples', () => {
		expect(isConstantMultiple(power(x, 2), x)).toBe(false)
		expect(isConstantMultiple(sum(x, 1), x)).toBe(false)
		expect(isConstantMultiple(product(x, y), x)).toBe(false)
	})

	test('rejects zero expressions', () => {
		expect(isConstantMultiple(Integer.zero, Integer.zero)).toBe(true)
		expect(isIntegerMultiple(Integer.zero, Integer.zero)).toBe(true)
		expect(isConstantMultiple(Integer.zero, x)).toBe(false)
		expect(isIntegerMultiple(Integer.zero, x)).toBe(false)
		expect(isConstantMultiple(x, Integer.zero)).toBe(false)
		expect(isIntegerMultiple(x, Integer.zero)).toBe(false)
	})
})
