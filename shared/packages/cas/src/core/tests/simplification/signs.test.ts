import { Integer, variable, negative, plusMinus, minusPlus } from '../../construction'

import { expectSimplifyToGive } from './utils'

const x = variable('x')

describe('sign simplification', () => {
	test('removes double negatives', () => {
		expectSimplifyToGive(negative(negative(x)), x, { removeDoubleNegatives: true })
		expectSimplifyToGive(negative(negative(negative(x))), negative(x), { removeDoubleNegatives: true })
		expectSimplifyToGive(negative(negative(negative(negative(x)))), x, { removeDoubleNegatives: true })
	})

	test('removes minus from zero', () => {
		expectSimplifyToGive(negative(Integer.zero), Integer.zero, { removeMinusFromZero: true })
		expectSimplifyToGive(negative(Integer.one), negative(Integer.one), { removeMinusFromZero: true })
	})

	test('removes double plus-minus signs', () => {
		expectSimplifyToGive(plusMinus(plusMinus(x)), plusMinus(x), { removeDoubleNegatives: true, removeDoublePlusMinusSigns: true })
		expectSimplifyToGive(plusMinus(plusMinus(plusMinus(x))), plusMinus(x), { removeDoubleNegatives: true, removeDoublePlusMinusSigns: true })
		expectSimplifyToGive(negative(plusMinus(x)), minusPlus(x), { removeDoubleNegatives: true, removeDoublePlusMinusSigns: true })
		expectSimplifyToGive(negative(minusPlus(x)), plusMinus(x), { removeDoubleNegatives: true, removeDoublePlusMinusSigns: true })
		expectSimplifyToGive(minusPlus(minusPlus(x)), plusMinus(x), { removeDoubleNegatives: true, removeDoublePlusMinusSigns: true })
	})
})
