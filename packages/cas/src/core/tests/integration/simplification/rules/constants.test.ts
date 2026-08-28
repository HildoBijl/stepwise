import { Integer, Float, product, power } from '../../../../construction/index.ts'

import { expectSimplifyToGive } from '../../../testUtils.ts'

describe('constant simplification', () => {
	test('turns floats into integers', () => {
		expectSimplifyToGive(new Float(3), 3, ['convertIntegerFloatsToIntegers'])
		expectSimplifyToGive(new Float(12), Integer.twelve, ['convertIntegerFloatsToIntegers'])
		expectSimplifyToGive(new Float(3.5), new Float(3.5), ['convertIntegerFloatsToIntegers'])
		expectSimplifyToGive(3.5, 3.5, ['convertIntegerFloatsToIntegers'])
	})

	test('factorizes integers', () => {
		expectSimplifyToGive(4, power(2, 2), ['factorizeIntegers'])
		expectSimplifyToGive(10, product(2, 5), ['factorizeIntegers'])
		expectSimplifyToGive(12, product(power(2, 2), 3), ['factorizeIntegers'])
		expectSimplifyToGive(16, power(2, 4), ['factorizeIntegers'])
		expectSimplifyToGive(1600, product(power(2, 6), power(5, 2)), ['factorizeIntegers'])
		expectSimplifyToGive(0, 0, ['factorizeIntegers'])
		expectSimplifyToGive(1, 1, ['factorizeIntegers'])
		expectSimplifyToGive(2, 2, ['factorizeIntegers'])
		expectSimplifyToGive(3, 3, ['factorizeIntegers'])
		expectSimplifyToGive(5, 5, ['factorizeIntegers'])
	})
})
