import { type ExpressionNode, namedConstants, integer, negative, plusMinus, variable, sum, product, fraction, power, sqrt, root, ln, log, stringToNode } from '../construction'
import { nodeToString, getNodeInterpretationSettingsInput } from '../export'

import { expectNodeToEqual } from './testUtils'

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
	{ str: 'π', node: namedConstants.pi },
	{ str: 'e', node: namedConstants.e },
	{ str: 'e_1', node: variable('e', '1') },

	// Sums
	{ str: '2+3', node: sum(2, 3) },
	{ str: '2-3', node: sum(2, -3) },
	{ str: '-2+3', node: sum(-2, 3) },
	{ str: '2+(3+4)', node: sum(2, sum(3, 4)) },
	{ str: '(x+y)+z', node: sum(sum('x', 'y'), 'z') },

	// Products
	{ str: '2x', node: product(2, 'x') },
	{ str: 'x*2', node: product('x', 2) },
	{ str: '-2x', node: negative(product(2, 'x')) },
	{ str: '(-2)x', node: product(-2, 'x') },
	{ str: 'x(-2)', node: product('x', -2) },
	{ str: '2(3*4)', node: product(2, product(3, 4)) },
	{ str: '(2*3)*4', node: product(product(2, 3), 4) },
	{ str: 'x(yz)', node: product('x', product('y', 'z')) },
	{ str: '(xy)z', node: product(product('x', 'y'), 'z') },
	{ str: 'xy*-z', node: product(product('x', 'y'), negative('z')), oneWay: true },
	{ str: '(xy)(-z)', node: product(product('x', 'y'), negative('z')) },
	{ str: 'x(-yz)', node: product('x', negative(product('y', 'z'))) },
	{ str: 'x((-y)z)', node: product('x', product(negative('y'), 'z')), oneWay: true },
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
	{ str: 'xy/z', node: fraction(product('x', 'y'), 'z'), oneWay: true },
	{ str: '(xy)/z', node: fraction(product('x', 'y'), 'z') },
	{ str: 'x*y/z', node: product('x', fraction('y', 'z')) },
	{ str: 'x/yz', node: fraction('x', product('y', 'z')), oneWay: true },
	{ str: 'x/(yz)', node: fraction('x', product('y', 'z')) },
	{ str: 'x/y*z', node: product(fraction('x', 'y'), 'z') },

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
	{ str: '(x/y)^z', node: power(fraction('x', 'y'), 'z') },

	// Square roots
	{ str: 'sqrt(x)', node: sqrt('x') },
	{ str: 'sqrt(2)', node: sqrt(2) },
	{ str: 'sqrt(x+y)', node: sqrt(sum('x', 'y')) },
	{ str: 'sqrt(xy)', node: sqrt(product('x', 'y')) },
	{ str: 'sqrt(x)^2', node: power(sqrt('x'), 2) },
	{ str: 'x*sqrt(y)', node: product('x', sqrt('y')) },

	// General roots
	{ str: 'root[3](x)', node: root('x', 3) },
	{ str: 'root[n](x)', node: root('x', 'n') },
	{ str: 'root[3](x+y)', node: root(sum('x', 'y'), 3) },
	{ str: 'root[3](xy)', node: root(product('x', 'y'), 3) },
	{ str: 'root[n+1](x^2)', node: root(power('x', 2), sum('n', 1)) },

	// Logarithms
	{ str: 'ln(x)', node: ln('x') },
	{ str: 'ln(2)', node: ln(2) },
	{ str: 'ln(x+y)', node: ln(sum('x', 'y')) },
	{ str: 'log[10](x)', node: log('x', 10) },
	{ str: 'log[b](x)', node: log('x', 'b') },
	{ str: 'log[x+y](z+2)', node: log(sum('z', 2), sum('x', 'y')) },
	{ str: 'x*ln(y)', node: product('x', ln('y')) },
	{ str: 'log[2](x)^3', node: power(log('x', 2), 3) },
]

// Test the printing: does the node give the string?
describe('toString', () => {
	test.each(parserTestCases)('prints "$str"', ({ str, node, oneWay }) => {
		if (!oneWay) expect(nodeToString(node, getNodeInterpretationSettingsInput(node))).toBe(str)
	})
})

// Test the parsing: does the string give the node?
describe('stringToExpressionNode', () => {
	test.each(parserTestCases)('interprets "$str"', ({ str, node }) => {
		expectNodeToEqual(stringToNode(str, getNodeInterpretationSettingsInput(node)), node)
	})
})

// Test the interpretation of multi-character variables.
describe('multi-character variable interpretation', () => {
	test('interprets adjacent letters as separate variables by default', () => {
		expectNodeToEqual(stringToNode('xy', {}), product('x', 'y'))
		expectNodeToEqual(stringToNode('xy2', {}), product('x', 'y', 2))
		expectNodeToEqual(stringToNode('23xy2', {}), product(23, 'x', 'y', 2))
	})
	test('interprets adjacent letters as one variable when enabled', () => {
		expectNodeToEqual(stringToNode('xy', { multiCharacterVariables: true }), variable('xy'))
		expectNodeToEqual(stringToNode('xy2', { multiCharacterVariables: true }), variable('xy2'))
		expectNodeToEqual(stringToNode('23xy2', { multiCharacterVariables: true }), product(23, variable('xy2')))
	})
	test('keeps infinity separate from variables', () => {
		expectNodeToEqual(stringToNode('∞xy', { multiCharacterVariables: true }), product(namedConstants.infinity, variable('xy')))
		expectNodeToEqual(stringToNode('23∞45xy', { multiCharacterVariables: true }), product(23, namedConstants.infinity, 45, variable('xy')))
	})
	test('prints products implicitly by default', () => {
		expect(nodeToString(product('x', 'y'))).toBe('xy')
		expect(nodeToString(product(23, 'x', 'y', 2))).toBe('23xy*2')
	})
	test('prints products explicitly when multi-character variables are enabled', () => {
		expect(nodeToString(product('x', 'y'), { multiCharacterVariables: true })).toBe('x*y')
		expect(nodeToString(product(23, 'x', 'y', 2), { multiCharacterVariables: true })).toBe('23x*y*2')
	})
	test('derives interpretation settings from multi-character variables', () => {
		const node = product(variable('xy'), 'z')
		expect(getNodeInterpretationSettingsInput(node)).toEqual({ multiCharacterVariables: true })
		expect(nodeToString(node, getNodeInterpretationSettingsInput(node))).toBe('xy*z')
	})
	test('does not enable multi-character variables for single-character variables', () => {
		const node = product('x', 'y')
		expect(getNodeInterpretationSettingsInput(node)).toEqual({})
		expect(nodeToString(node, getNodeInterpretationSettingsInput(node))).toBe('xy')
	})
})
