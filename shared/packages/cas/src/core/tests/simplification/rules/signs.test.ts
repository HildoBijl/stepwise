import { Integer, variable, negative, plusMinus } from '../../../construction'

import { expectSimplifyToGive } from '../testUtils'

const x = variable('x')

describe('sign simplification', () => {
	test('removes double negatives', () => {
		expectSimplifyToGive(negative(negative(x)), x, ['removeDoubleNegatives'])
		expectSimplifyToGive(negative(negative(negative(x))), negative(x), ['removeDoubleNegatives'])
		expectSimplifyToGive(negative(negative(negative(negative(x)))), x, ['removeDoubleNegatives'])
	})

	test('removes minus from zero', () => {
		expectSimplifyToGive(negative(Integer.zero), Integer.zero, ['removeSignsFromZeros'])
		expectSimplifyToGive(negative(Integer.one), negative(Integer.one), ['removeSignsFromZeros'])
	})

	test('removes double plus-minus signs', () => {
		expectSimplifyToGive(plusMinus(plusMinus(x)), plusMinus(x), ['removeDoubleNegatives', 'removeDoubleSigns'])
		expectSimplifyToGive(plusMinus(plusMinus(plusMinus(x))), plusMinus(x), ['removeDoubleNegatives', 'removeDoubleSigns'])
		expectSimplifyToGive(negative(plusMinus(x)), plusMinus(x), ['removeDoubleNegatives', 'removeDoubleSigns'])
		expectSimplifyToGive(plusMinus(negative(x)), plusMinus(x), ['removeDoubleNegatives', 'removeDoubleSigns'])
		expectSimplifyToGive(negative(plusMinus(negative(x))), plusMinus(x), ['removeDoubleNegatives', 'removeDoubleSigns'])
	})
})
