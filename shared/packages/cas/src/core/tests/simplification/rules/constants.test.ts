import { Integer, Float, Product, Power } from '../../../construction'

import { expectSimplifyToGive } from '../testUtils'

describe('constant simplification', () => {
	test('turns floats into integers', () => {
		expectSimplifyToGive(new Float(3), Integer.three, ['turnFloatsIntoIntegers'])
		expectSimplifyToGive(new Float(12), Integer.twelve, ['turnFloatsIntoIntegers'])
		expectSimplifyToGive(new Float(3.5), new Float(3.5), ['turnFloatsIntoIntegers'])
	})

	test('factorizes integers', () => {
		expectSimplifyToGive(new Integer(4), new Power(Integer.two, Integer.two), ['factorizeIntegers'])
		expectSimplifyToGive(new Integer(10), new Product([Integer.two, Integer.five]), ['factorizeIntegers'])
		expectSimplifyToGive(new Integer(12), new Product([new Power(Integer.two, Integer.two), Integer.three]), ['factorizeIntegers'])
		expectSimplifyToGive(new Integer(16), new Power(Integer.two, new Power(Integer.two, Integer.two)), ['factorizeIntegers'])
		expectSimplifyToGive(Integer.zero, Integer.zero, ['factorizeIntegers'])
		expectSimplifyToGive(Integer.one, Integer.one, ['factorizeIntegers'])
		expectSimplifyToGive(Integer.two, Integer.two, ['factorizeIntegers'])
		expectSimplifyToGive(Integer.three, Integer.three, ['factorizeIntegers'])
		expectSimplifyToGive(Integer.five, Integer.five, ['factorizeIntegers'])
	})
})
