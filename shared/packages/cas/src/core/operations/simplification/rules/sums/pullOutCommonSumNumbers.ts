import { gcd } from '@step-wise/math-tools'

import { type ExpressionNode, type ConstantNode, Integer, Sum, Product } from '../../../../construction'
import { isSignNode, isConstantNode, isIntegerNode, isProduct } from '../../../structural'

// If all leading numbers are integers, and their GCD is not one, then pull out an integer.
export function pullOutCommonSumNumbers(node: Sum): ExpressionNode {
	if (node.terms.length <= 1) return node
	const leadingNumbers = node.terms.map(getLeadingNumber)
	if (!leadingNumbers.every(isIntegerNode)) return node
	let divisor = gcd(...leadingNumbers.map(node => node.value))
	if (divisor === 1) return node
	const terms = node.terms.map(term => divideLeadingNumberBy(term, divisor))
	return new Product([new Integer(divisor), new Sum(terms)])
}

// Get the number that's at the front of the given expression.
function getLeadingNumber(node: ExpressionNode): ConstantNode {
	if (isConstantNode(node)) return node
	if (isSignNode(node)) return getLeadingNumber(node.node)
	if (isProduct(node) && node.factors.length > 0 && isConstantNode(node.factors[0])) return node.factors[0]
	return Integer.one
}

// Take the expression's leading number and divide it by the given factor. It assumes that's possible.
function divideLeadingNumberBy(node: ExpressionNode, factor: number): ExpressionNode {
	if (isConstantNode(node)) return new Integer(node.value / factor)
	if (isSignNode(node)) return node.recreateWith(divideLeadingNumberBy(node.node, factor))
	if (isProduct(node) && node.factors.length > 0 && isConstantNode(node.factors[0])) return new Product([divideLeadingNumberBy(node.factors[0], factor), ...node.factors.slice(1)])
	throw new Error(`Could not divide the leading number of the expression by the factor: the types don't line up.`)
}
