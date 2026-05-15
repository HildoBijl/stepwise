import { variable, sqrt, root, sum, product, fraction, power } from '../../../construction'

import { expectSimplifyToGive } from '../../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('root simplification', () => {
	test('reduces roots with zero argument', () => {
		expectSimplifyToGive(sqrt(0), 0, ['reduceRootsWithZeroRadicand'])
		expectSimplifyToGive(root(0, 3), 0, ['reduceRootsWithZeroRadicand'])
	})

	test('reduces roots with one argument', () => {
		expectSimplifyToGive(sqrt(1), 1, ['reduceRootsWithOneRadicand'])
		expectSimplifyToGive(root(1, 3), 1, ['reduceRootsWithOneRadicand'])
	})

	test('reduces integer roots', () => {
		expectSimplifyToGive(sqrt(25), 5, ['reduceIntegerRoots'])
		expectSimplifyToGive(sqrt(24), sqrt(24), ['reduceIntegerRoots'])
		expectSimplifyToGive(root(27, 3), 3, ['reduceIntegerRoots'])
		expectSimplifyToGive(root(28, 3), root(28, 3), ['reduceIntegerRoots'])
	})

	test('reduces canceled roots', () => {
		expectSimplifyToGive(sqrt(power(x, 2)), x, ['reduceCanceledRoots'])
		expectSimplifyToGive(root(power(x, 3), 3), x, ['reduceCanceledRoots'])
		expectSimplifyToGive(root(power(sum(x, y), 4), 4), sum(x, y), ['reduceCanceledRoots'])
		expectSimplifyToGive(power(root(sum(x, y), 4), 4), sum(x, y), ['reduceCanceledRoots'])
	})

	test('turns roots into fraction exponents', () => {
		expectSimplifyToGive(sqrt(x), power(x, fraction(1, 2)), ['turnRootsIntoFractionExponents'])
		expectSimplifyToGive(root(x, 3), power(x, fraction(1, 3)), ['turnRootsIntoFractionExponents'])
		expectSimplifyToGive(root(sum(x, y), 4), power(sum(x, y), fraction(1, 4)), ['turnRootsIntoFractionExponents'])
	})

	test('turns fraction exponents into roots', () => {
		expectSimplifyToGive(power(x, fraction(1, 2)), root(x, 2), ['removeOneExponentsFromPowers', 'turnFractionExponentsIntoRoots'])
		expectSimplifyToGive(power(x, fraction(1, 3)), root(x, 3), ['removeOneExponentsFromPowers', 'turnFractionExponentsIntoRoots'])
		expectSimplifyToGive(power(x, fraction(2, 3)), root(power(x, 2), 3), ['removeOneExponentsFromPowers', 'turnFractionExponentsIntoRoots'])
		expectSimplifyToGive(power(x, fraction(8, 3)), root(power(x, 8), 3), ['removeOneExponentsFromPowers', 'turnFractionExponentsIntoRoots'])
	})

	test('turns base two roots into square roots', () => {
		expectSimplifyToGive(root(x, 2), sqrt(x), ['turnDegreeTwoRootsIntoSqrts'])
		expectSimplifyToGive(root(sum(x, y), 2), sqrt(sum(x, y)), ['turnDegreeTwoRootsIntoSqrts'])
		expectSimplifyToGive(root(x, 3), root(x, 3), ['turnDegreeTwoRootsIntoSqrts'])
	})

	test('turns square roots into base two roots', () => {
		expectSimplifyToGive(sqrt(x), root(x, 2), ['turnSqrtsIntoDegreeTwoRoots'])
		expectSimplifyToGive(sqrt(sum(x, y)), root(sum(x, y), 2), ['turnSqrtsIntoDegreeTwoRoots'])
		expectSimplifyToGive(root(x, 2), root(x, 2), ['turnSqrtsIntoDegreeTwoRoots'])
	})

	test('expands roots of products', () => {
		expectSimplifyToGive(sqrt(product(x, y)), product(sqrt(x), sqrt(y)), ['expandRootsOfProducts'])
		expectSimplifyToGive(sqrt(product(x, y, z)), product(sqrt(x), sqrt(y), sqrt(z)), ['expandRootsOfProducts'])
		expectSimplifyToGive(root(product(x, y), 3), product(root(x, 3), root(y, 3)), ['expandRootsOfProducts'])
	})

	test('merges products of roots', () => {
		expectSimplifyToGive(product(sqrt(x), sqrt(y)), sqrt(product(x, y)), ['mergeProductsOfRoots'])
		expectSimplifyToGive(product(sqrt(x), sqrt(y), sqrt(z)), sqrt(product(x, y, z)), ['mergeProductsOfRoots'])
		expectSimplifyToGive(product(root(x, 3), root(y, 3)), root(product(x, y), 3), ['mergeProductsOfRoots'])
		expectSimplifyToGive(product(root(x, 3), root(y, 4)), product(root(x, 3), root(y, 4)), ['mergeProductsOfRoots'])
	})

	test('pulls exponents into roots', () => {
		expectSimplifyToGive(power(sqrt(x), 3), sqrt(power(x, 3)), ['pullExponentsIntoRoots'])
		expectSimplifyToGive(power(root(x, 3), 2), root(power(x, 2), 3), ['pullExponentsIntoRoots'])
		expectSimplifyToGive(power(sqrt(sum(x, y)), z), sqrt(power(sum(x, y), z)), ['pullExponentsIntoRoots'])
	})

	test('pulls factors out of roots', () => {
		expectSimplifyToGive(sqrt(20), product(2, sqrt(5)), ['removeOneExponentsFromPowers', 'pullFactorsOutOfRoots'])
		expectSimplifyToGive(root(54, 3), product(3, root(2, 3)), ['removeOneExponentsFromPowers', 'pullFactorsOutOfRoots'])
		expectSimplifyToGive(sqrt(product(power(x, 3), power(y, 4), power(z, 5))), product(x, power(y, 2), power(z, 2), sqrt(product(x, z))), ['removeOneExponentsFromPowers', 'pullFactorsOutOfRoots'])
		expectSimplifyToGive(root(product(power(x, 4), power(y, 5)), 3), product(x, y, root(product(x, power(y, 2)), 3)), ['removeOneExponentsFromPowers', 'pullFactorsOutOfRoots'])
	})

	test('prevents root denominators', () => {
		expectSimplifyToGive(fraction(1, sqrt(2)), fraction(sqrt(2), 2), ['mergeSumNumbers', 'removeOnesFromProducts', 'removeOneExponentsFromPowers', 'preventRootDenominators'])
		expectSimplifyToGive(fraction(x, sqrt(y)), fraction(product(x, sqrt(y)), y), ['mergeSumNumbers', 'removeOnesFromProducts', 'removeOneExponentsFromPowers', 'preventRootDenominators'])
		expectSimplifyToGive(fraction(1, root(x, 3)), fraction(root(power(x, 2), 3), x), ['mergeSumNumbers', 'removeOnesFromProducts', 'removeOneExponentsFromPowers', 'preventRootDenominators'])
		expectSimplifyToGive(fraction(1, product(2, sqrt(x))), fraction(sqrt(x), product(2, x)), ['mergeSumNumbers', 'removeOnesFromProducts', 'removeOneExponentsFromPowers', 'preventRootDenominators'])
	})
})
