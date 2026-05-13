import { defaultInterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, integer, negative, plusMinus, variable, sum, product, fraction, power, stringToNode } from '../construction'
import { equalNodes } from '../operations'

import { nodeToString } from '../export/printing/toString'

type ParserTestCase = {
	str: string
	node: ExpressionNode
	oneWay?: true
}

// Define bidirectional test cases: the string should give the node and vice versa.
const parserTestCases: ParserTestCase[] = [
	// Numbers
	{ str: '2', node: integer(2) },
	{ str: '-2', node: integer(-2) },
	{ str: '±2', node: plusMinus(2) },
	{ str: '-(-(-2))', node: negative(negative(negative(2))) },

	// Variables
	{ str: 'x', node: variable('x') },
	{ str: 'x_2', node: variable('x', '2') },
	{ str: 'hat(x)', node: variable('x', undefined, 'hat') },
	{ str: 'dot(x)_1', node: variable('x', '1', 'dot') },
	{ str: 'x_(1,2)', node: variable('x', '1,2') },

	// Sums
	{ str: '2+3', node: sum(2, 3) },
	{ str: '2-3', node: sum(2, -3) },
	{ str: '-2+3', node: sum(-2, 3) },
	{ str: '2+(3+4)', node: sum(2, sum(3, 4)) },
	{ str: '(x+y)+z', node: sum(sum('x', 'y'), 'z') },

	// Products (Some tests do not give the original node after a jump through a string. This is still a work-in-progress.)
	{ str: '2x', node: product(2, 'x') },
	{ str: 'x*2', node: product('x', 2) },
	{ str: '-2x', node: negative(product(2, 'x')) },
	{ str: '(-2)x', node: product(-2, 'x') },
	{ str: 'x*-2', node: product('x', -2) },
	{ str: '2(3*4)', node: product(2, product(3, 4)) },
	{ str: '(2*3)*4', node: product(product(2, 3), 4) },
	{ str: 'x(yz)', node: product('x', product('y', 'z')) },
	{ str: '(xy)z', node: product(product('x', 'y'), 'z') },
	// { str: 'xy*-z', node: product('x', 'y', negative('z')) },
	{ str: '(xy)*-z', node: product(product('x', 'y'), negative('z')) },
	{ str: 'x*-yz', node: product('x', negative(product('y', 'z'))) },
	// { str: 'x*(-y)z', node: product('x', negative('y'), 'z') },
	{ str: 'x((-y)z)', node: product('x', product(negative('y'), 'z')) },

	// Fractions
	{ str: '2/3', node: fraction(2, 3) },
	{ str: '-2/3', node: negative(fraction(2, 3)) },
	{ str: '(-2)/3', node: fraction(-2, 3) },
	{ str: '2*3/4', node: product(2, fraction(3, 4)) },
	{ str: '2/3/4', node: fraction(fraction(2, 3), 4) },
	{ str: '2/3*4', node: product(fraction(2, 3), 4) },
	{ str: '2*3/4*5', node: product(2, fraction(3, 4), 5) },
	{ str: '2/3/4*5', node: product(fraction(fraction(2, 3), 4), 5) },
	{ str: '2/3*4/5', node: product(fraction(2, 3), fraction(4, 5)) },
	{ str: '2*3/4/5', node: product(2, fraction(fraction(3, 4), 5)) },
	{ str: '2-3*4/5', node: sum(2, negative(product(3, fraction(4, 5)))) },
	{ str: '1/2*x', node: product(fraction(1, 2), 'x') },
	// { str: '1/2x', node: product(fraction(1, 2), 'x'), oneWay: true },

	// Powers
	{ str: 'x^y', node: power('x', 'y') },
	{ str: '2^34', node: power(2, 34) },
	{ str: 'x^yz', node: product(power('x', 'y'), 'z') },
	{ str: '23^4', node: power(23, 4) },
	{ str: 'xy^z', node: product('x', power('y', 'z')) },
	{ str: 'x^yz^w', node: product(power('x', 'y'), power('z', 'w')) },
	{ str: '(x^y)^z', node: power(power('x', 'y'), 'z') },
	{ str: 'x^(y^z)', node: power('x', power('y', 'z')) },
	{ str: 'x^y/z', node: fraction(power('x', 'y'), 'z') },
	{ str: 'x/y^z', node: fraction('x', power('y', 'z')) },
	{ str: 'x^(y/z)', node: power('x', fraction('y', 'z')) },
]

// Test printing: does the node give the string?
describe('toString', () => {
	test.each(parserTestCases)('prints "$str"', ({ str, node, oneWay }) => {
		if (!oneWay)
			expect(nodeToString(node)).toBe(str)
	})
})

// Test parsing: does the string give the node?
describe('stringToExpressionNode', () => {
	test.each(parserTestCases)('interprets "$str"', ({ str, node }) => {
		expect(equalNodes(stringToNode(str, defaultInterpretationSettings), node)).toBe(true)
	})
})
