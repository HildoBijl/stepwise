import { variable, negative, sum, product, power } from '../../construction'

import { expectSimplifyToGive } from './utils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('sum simplification', () => {
	test('flattens sums', () => {
		expectSimplifyToGive(sum(x, sum(y, z)), sum(x, y, z), { flattenSums: true })
		expectSimplifyToGive(sum(sum(x, y), sum(z)), sum(x, y, z), { flattenSums: true })
	})

	test('removes plus zero from sums', () => {
		const x = variable('x')
		expectSimplifyToGive(sum(x, 0), sum(x), { removePlusZeroFromSums: true })
		expectSimplifyToGive(sum(0, x, 0), sum(x), { removePlusZeroFromSums: true })
	})

	test('merges sum numbers', () => {
		const x = variable('x')
		expectSimplifyToGive(sum(2, x, 3), sum(x, 5), { mergeSumNumbers: true })
		expectSimplifyToGive(sum(2, x, -5), sum(x, -3), { mergeSumNumbers: true })
		expectSimplifyToGive(sum(3, x, -3), sum(x, 0), { mergeSumNumbers: true })
		expectSimplifyToGive(sum(2, 3), sum(5), { mergeSumNumbers: true })
	})

	test('cancels sum terms', () => {
		expectSimplifyToGive(sum(x, negative(x)), sum(), { cancelSumTerms: true })
		expectSimplifyToGive(sum(x, y, negative(x)), sum(y), { cancelSumTerms: true })
	})

	test('groups sum terms', () => {
		expectSimplifyToGive(sum(product(2, x), product(3, x)), product(sum(2, 3), x), { groupSumTerms: true })
		expectSimplifyToGive(sum(product(2, x), y, product(3, x)), sum(product(sum(2, 3), x), y), { groupSumTerms: true })
		expectSimplifyToGive(sum(product(2, x), y, product(-2, x)), sum(product(sum(2, -2), x), y), { groupSumTerms: true })
		expectSimplifyToGive(sum(product(2, x, y), product(3, y, x)), product(sum(2, 3), product(x, y)), { groupSumTerms: true })
	})

	test('pulls out common sum numbers', () => {
		expectSimplifyToGive(sum(product(6, x), product(9, y)), product(3, sum(product(2, x), product(3, y))), { pullOutCommonSumNumbers: true })
		expectSimplifyToGive(sum(product(4, x), product(10, y), 6), product(2, sum(product(2, x), product(5, y), 3)), { pullOutCommonSumNumbers: true })
		expectSimplifyToGive(sum(product(5, x), product(7, y)), sum(product(5, x), product(7, y)), { pullOutCommonSumNumbers: true })
	})

	test('pulls out common sum factors', () => {
		expectSimplifyToGive(sum(product(x, y), product(x, z)), product(x, sum(y, z)), { pullOutCommonSumFactors: true })
		expectSimplifyToGive(sum(product(x, y, z), product(x, y)), product(product(x, y), sum(z, 1)), { pullOutCommonSumFactors: true })
		expectSimplifyToGive(sum(product(x, y), product(x, z), x), product(x, sum(y, z, 1)), { pullOutCommonSumFactors: true })
		expectSimplifyToGive(sum(product(x, y), product(z, y)), product(y, sum(x, z)), { pullOutCommonSumFactors: true })
		expectSimplifyToGive(sum(product(x, y), product(x, y)), product(product(x, y), sum(1, 1)), { pullOutCommonSumFactors: true })
	})

	test('sorts sums', () => {
		expectSimplifyToGive(sum(2, x), sum(x, 2), { sortSums: true })
		expectSimplifyToGive(sum(y, x), sum(x, y), { sortSums: true })
		expectSimplifyToGive(sum(x, 1, power(x, 2)), sum(power(x, 2), x, 1), { sortSums: true })
		expectSimplifyToGive(sum(1, x, y, power(x, 2), power(y, 2), product(x, y)), sum(power(x, 2), product(x, y), x, power(y, 2), y, 1), { sortSums: true }, undefined)
	})
})
