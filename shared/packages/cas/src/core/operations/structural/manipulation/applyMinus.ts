import { ExpressionNode, ConstantNode, Integer, Float, Sum, Product, Fraction } from '../../../construction'

export function applyMinus(node: ExpressionNode, applySpecific = true): ExpressionNode {
	if (node instanceof Integer) return new Integer(-node.value)
	if (node instanceof Float) return new Float(-node.value)
	if (applySpecific && node instanceof Sum) return new Sum(node.terms.map(term => applyMinus(term, applySpecific)))
	if (applySpecific && node instanceof Fraction) return new Fraction(applyMinus(node.numerator, applySpecific), node.denominator)
	if (applySpecific && node instanceof Product) {
		const [first, ...rest] = node.factors
		if (first instanceof ConstantNode) return new Product([applyMinus(first, applySpecific), ...rest])
		return new Product([Integer.minusOne, node])
	}
	return new Product([Integer.minusOne, node])
}
