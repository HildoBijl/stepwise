import { Integer, Float, Product, Power } from '../../construction'

import { expectSimplifyToGive } from './testUtils'

describe('constant simplification', () => {
	test('turns floats into integers', () => {
		expectSimplifyToGive(new Float(3), Integer.three, { turnFloatsIntoIntegers: true })
		expectSimplifyToGive(new Float(12), Integer.twelve, { turnFloatsIntoIntegers: true })
		expectSimplifyToGive(new Float(3.5), new Float(3.5), { turnFloatsIntoIntegers: true })
	})

	test('factorizes integers', () => {
		expectSimplifyToGive(new Integer(4), new Power(Integer.two, Integer.two), { factorizeIntegers: true })
		expectSimplifyToGive(new Integer(10), new Product([Integer.two, Integer.five]), { factorizeIntegers: true })
		expectSimplifyToGive(new Integer(12), new Product([new Power(Integer.two, Integer.two), Integer.three]), { factorizeIntegers: true })
		expectSimplifyToGive(new Integer(16), new Power(Integer.two, new Power(Integer.two, Integer.two)), { factorizeIntegers: true })
		expectSimplifyToGive(Integer.zero, Integer.zero, { factorizeIntegers: true })
		expectSimplifyToGive(Integer.one, Integer.one, { factorizeIntegers: true })
		expectSimplifyToGive(Integer.two, Integer.two, { factorizeIntegers: true })
		expectSimplifyToGive(Integer.three, Integer.three, { factorizeIntegers: true })
		expectSimplifyToGive(Integer.five, Integer.five, { factorizeIntegers: true })
	})
})
