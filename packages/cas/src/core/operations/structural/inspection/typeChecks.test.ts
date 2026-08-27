import { fraction, integer, ln, negative, plusMinus, power, product, root, sin, sqrt, sum, variable } from '../../../construction'

import { isExpressionNode, isFraction, isFunctionNode, isIntegerNode, isListNode, isLogarithmFunction, isMinus, isPlusMinus, isPower, isProduct, isRootFunction, isSignNode, isSingleArgumentFunctionNode, isSum, isTrigonometricFunction, isVariable } from './typeChecks'

describe('expression-node type checks', () => {
	test.each([
		[integer(1), isIntegerNode], [negative(1), isMinus], [plusMinus(1), isPlusMinus], [variable('x'), isVariable],
		[sum(1, 2), isSum], [product(1, 2), isProduct], [fraction(1, 2), isFraction], [power('x', 2), isPower],
	])('recognizes a concrete subtype', (node, check) => {
		expect(check(node)).toBe(true)
		expect(isExpressionNode(node)).toBe(true)
	})

	test('recognizes abstract node families', () => {
		expect(isSignNode(negative(1))).toBe(true)
		expect(isListNode(sum(1, 2))).toBe(true)
		expect(isFunctionNode(fraction(1, 2))).toBe(true)
		expect(isSingleArgumentFunctionNode(sin('x'))).toBe(true)
		expect(isRootFunction(root('x', 3))).toBe(true)
		expect(isRootFunction(sqrt('x'))).toBe(true)
		expect(isLogarithmFunction(ln('x'))).toBe(true)
		expect(isTrigonometricFunction(sin('x'))).toBe(true)
	})
})
