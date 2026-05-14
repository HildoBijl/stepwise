import { Integer, variable, negative, plusMinus, minusPlus } from '../../../construction'

import { expectSimplifyToGive } from '../testUtils'

const x = variable('x')

describe('sign simplification', () => {
	test('removes double negatives', () => {
		expectSimplifyToGive(negative(negative(x)), x, ['removeDoubleNegatives'])
		expectSimplifyToGive(negative(negative(negative(x))), negative(x), ['removeDoubleNegatives'])
		expectSimplifyToGive(negative(negative(negative(negative(x)))), x, ['removeDoubleNegatives'])
	})

	test('removes minus from zero', () => {
		expectSimplifyToGive(negative(Integer.zero), Integer.zero, ['removeMinusFromZero'])
		expectSimplifyToGive(negative(Integer.one), negative(Integer.one), ['removeMinusFromZero'])
	})

	test('removes double plus-minus signs', () => {
		expectSimplifyToGive(plusMinus(plusMinus(x)), plusMinus(x), ['removeDoubleNegatives', 'removeDoublePlusMinusSigns'])
		expectSimplifyToGive(plusMinus(plusMinus(plusMinus(x))), plusMinus(x), ['removeDoubleNegatives', 'removeDoublePlusMinusSigns'])
		expectSimplifyToGive(negative(plusMinus(x)), minusPlus(x), ['removeDoubleNegatives', 'removeDoublePlusMinusSigns'])
		expectSimplifyToGive(negative(minusPlus(x)), plusMinus(x), ['removeDoubleNegatives', 'removeDoublePlusMinusSigns'])
		expectSimplifyToGive(minusPlus(minusPlus(x)), plusMinus(x), ['removeDoubleNegatives', 'removeDoublePlusMinusSigns'])
	})
})
