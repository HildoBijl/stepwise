import { type ExpressionNodeInput, asExpressionNode, negative, plusMinus, variable, sum, product, fraction, power } from '../construction'
import { equivalent } from '../operations'

const x = variable('x')
const y = variable('y')

// Define supporting checks.
function expectEquivalent(a: ExpressionNodeInput, b: ExpressionNodeInput) {
	expect(equivalent(asExpressionNode(a), asExpressionNode(b))).toBe(true)
}
function expectNotEquivalent(a: ExpressionNodeInput, b: ExpressionNodeInput) {
	expect(equivalent(asExpressionNode(a), asExpressionNode(b))).toBe(false)
}

// Run the tests.
describe('equivalence comparisons', () => {
	test('detects simple equal expressions', () => {
		expectEquivalent(x, x)
		expectEquivalent(sum(x, 1), sum(1, x))
		expectEquivalent(product(2, x), product(x, 2))
	})

	test('detects equivalence through normalization', () => {
		expectEquivalent(sum(x, 1, -1), x)
		expectEquivalent(sum(product(2, x), product(3, x)), product(5, x))
		expectEquivalent(fraction(product(x, y), y), x)
		expectEquivalent(power(power(x, 2), 3), power(x, 6))
	})

	test('detects non-equivalence', () => {
		expectNotEquivalent(x, y)
		expectNotEquivalent(sum(x, 1), sum(x, 2))
		expectNotEquivalent(product(2, x), product(3, x))
	})

	test('handles fractions and signs', () => {
		expectEquivalent(fraction(negative(x), negative(y)), fraction(x, y))
		expectEquivalent(fraction(negative(x), y), negative(fraction(x, y)))
		expectNotEquivalent(fraction(x, y), fraction(y, x))
	})

	test('handles equivalent plural expressions', () => {
		expectEquivalent(plusMinus(x), plusMinus(x))
		expectEquivalent(negative(plusMinus(x)), plusMinus(x))
		expectEquivalent(sum(x, plusMinus(2)), sum(x, plusMinus(2)))
		expectEquivalent(sum(x, plusMinus(2)), sum(plusMinus(2), x))
		expectEquivalent(sum(x, plusMinus(2), plusMinus(3)), sum(x, plusMinus(3), plusMinus(2)))
	})

	test('detects non-equivalent plural expressions', () => {
		expectNotEquivalent(plusMinus(x), x)
		expectNotEquivalent(sum(x, plusMinus(2)), sum(x, 2))
		expectNotEquivalent(sum(x, plusMinus(2)), sum(x, plusMinus(3)))
		expectNotEquivalent(sum(x, plusMinus(2), plusMinus(3)), sum(x, plusMinus(2), plusMinus(4)))
	})
})
