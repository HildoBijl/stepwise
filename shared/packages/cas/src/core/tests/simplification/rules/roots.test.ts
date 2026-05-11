import { variable, sqrt, root, sum, product, fraction, power } from '../../../construction'

import { expectSimplifyToGive } from '../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('root simplification', () => {
	test('reduces roots with zero argument', () => {
		expectSimplifyToGive(sqrt(0), 0, { reduceRootsWithZeroArgument: true })
		expectSimplifyToGive(root(0, 3), 0, { reduceRootsWithZeroArgument: true })
	})

	test('reduces roots with one argument', () => {
		expectSimplifyToGive(sqrt(1), 1, { reduceRootsWithOneArgument: true })
		expectSimplifyToGive(root(1, 3), 1, { reduceRootsWithOneArgument: true })
	})

	test('reduces integer roots', () => {
		expectSimplifyToGive(sqrt(25), 5, { reduceIntegerRoots: true })
		expectSimplifyToGive(sqrt(24), sqrt(24), { reduceIntegerRoots: true })
		expectSimplifyToGive(root(27, 3), 3, { reduceIntegerRoots: true })
		expectSimplifyToGive(root(28, 3), root(28, 3), { reduceIntegerRoots: true })
	})

	test('reduces canceled roots', () => {
		expectSimplifyToGive(sqrt(power(x, 2)), x, { reduceCanceledRoots: true })
		expectSimplifyToGive(root(power(x, 3), 3), x, { reduceCanceledRoots: true })
		expectSimplifyToGive(root(power(sum(x, y), 4), 4), sum(x, y), { reduceCanceledRoots: true })
		expectSimplifyToGive(power(root(sum(x, y), 4), 4), sum(x, y), { reduceCanceledRoots: true })
	})

	test('turns roots into fraction exponents', () => {
		expectSimplifyToGive(sqrt(x), power(x, fraction(1, 2)), { turnRootsIntoFractionExponents: true })
		expectSimplifyToGive(root(x, 3), power(x, fraction(1, 3)), { turnRootsIntoFractionExponents: true })
		expectSimplifyToGive(root(sum(x, y), 4), power(sum(x, y), fraction(1, 4)), { turnRootsIntoFractionExponents: true })
	})

	test('turns fraction exponents into roots', () => {
		expectSimplifyToGive(power(x, fraction(1, 2)), root(x, 2), { removeOneExponentFromPowers: true, turnFractionExponentsIntoRoots: true })
		expectSimplifyToGive(power(x, fraction(1, 3)), root(x, 3), { removeOneExponentFromPowers: true, turnFractionExponentsIntoRoots: true })
		expectSimplifyToGive(power(x, fraction(2, 3)), root(power(x, 2), 3), { removeOneExponentFromPowers: true, turnFractionExponentsIntoRoots: true })
		expectSimplifyToGive(power(x, fraction(8, 3)), root(power(x, 8), 3), { removeOneExponentFromPowers: true, turnFractionExponentsIntoRoots: true })
	})

	test('turns base two roots into square roots', () => {
		expectSimplifyToGive(root(x, 2), sqrt(x), { turnBaseTwoRootsIntoSqrts: true })
		expectSimplifyToGive(root(sum(x, y), 2), sqrt(sum(x, y)), { turnBaseTwoRootsIntoSqrts: true })
		expectSimplifyToGive(root(x, 3), root(x, 3), { turnBaseTwoRootsIntoSqrts: true })
	})

	test('turns square roots into base two roots', () => {
		expectSimplifyToGive(sqrt(x), root(x, 2), { turnSqrtsIntoBaseTwoRoots: true })
		expectSimplifyToGive(sqrt(sum(x, y)), root(sum(x, y), 2), { turnSqrtsIntoBaseTwoRoots: true })
		expectSimplifyToGive(root(x, 2), root(x, 2), { turnSqrtsIntoBaseTwoRoots: true })
	})

	test('expands roots of products', () => {
		expectSimplifyToGive(sqrt(product(x, y)), product(sqrt(x), sqrt(y)), { expandRootsOfProducts: true })
		expectSimplifyToGive(sqrt(product(x, y, z)), product(sqrt(x), sqrt(y), sqrt(z)), { expandRootsOfProducts: true })
		expectSimplifyToGive(root(product(x, y), 3), product(root(x, 3), root(y, 3)), { expandRootsOfProducts: true })
	})

	test('merges products of roots', () => {
		expectSimplifyToGive(product(sqrt(x), sqrt(y)), sqrt(product(x, y)), { mergeProductsOfRoots: true })
		expectSimplifyToGive(product(sqrt(x), sqrt(y), sqrt(z)), sqrt(product(x, y, z)), { mergeProductsOfRoots: true })
		expectSimplifyToGive(product(root(x, 3), root(y, 3)), root(product(x, y), 3), { mergeProductsOfRoots: true })
		expectSimplifyToGive(product(root(x, 3), root(y, 4)), product(root(x, 3), root(y, 4)), { mergeProductsOfRoots: true })
	})

	test('pulls exponents into roots', () => {
		expectSimplifyToGive(power(sqrt(x), 3), sqrt(power(x, 3)), { pullExponentsIntoRoots: true })
		expectSimplifyToGive(power(root(x, 3), 2), root(power(x, 2), 3), { pullExponentsIntoRoots: true })
		expectSimplifyToGive(power(sqrt(sum(x, y)), z), sqrt(power(sum(x, y), z)), { pullExponentsIntoRoots: true })
	})

	test('pulls factors out of roots', () => {
		expectSimplifyToGive(sqrt(20), product(2, sqrt(5)), { removeOneExponentFromPowers: true, pullFactorsOutOfRoots: true })
		expectSimplifyToGive(root(54, 3), product(3, root(2, 3)), { removeOneExponentFromPowers: true, pullFactorsOutOfRoots: true })
		expectSimplifyToGive(sqrt(product(power(x, 3), power(y, 4), power(z, 5))), product(x, power(y, 2), power(z, 2), sqrt(product(x, z))), { removeOneExponentFromPowers: true, pullFactorsOutOfRoots: true })
		expectSimplifyToGive(root(product(power(x, 4), power(y, 5)), 3), product(x, y, root(product(x, power(y, 2)), 3)), { removeOneExponentFromPowers: true, pullFactorsOutOfRoots: true })
	})

	test('prevents root denominators', () => {
		expectSimplifyToGive(fraction(1, sqrt(2)), fraction(sqrt(2), 2), { mergeSumNumbers: true, removeTimesOneFromProducts: true, removeOneExponentFromPowers: true, preventRootDenominators: true })
		expectSimplifyToGive(fraction(x, sqrt(y)), fraction(product(x, sqrt(y)), y), { mergeSumNumbers: true, removeTimesOneFromProducts: true, removeOneExponentFromPowers: true, preventRootDenominators: true })
		expectSimplifyToGive(fraction(1, root(x, 3)), fraction(root(power(x, 2), 3), x), { mergeSumNumbers: true, removeTimesOneFromProducts: true, removeOneExponentFromPowers: true, preventRootDenominators: true })
		expectSimplifyToGive(fraction(1, product(2, sqrt(x))), fraction(sqrt(x), product(2, x)), { mergeSumNumbers: true, removeTimesOneFromProducts: true, removeOneExponentFromPowers: true, preventRootDenominators: true })
	})
})
