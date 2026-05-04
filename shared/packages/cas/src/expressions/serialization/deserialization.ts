import { ExpressionNode, Integer, Float, PlusMinus, Variable, Sum, Product, Power, Fraction, Root, Ln } from '../nodes'

import { ExpressionNodeStorageValue } from './types'

export function storageValueToNode(storageValue: ExpressionNodeStorageValue): ExpressionNode {
	// Constants
	if (storageValue.subtype === 'Integer') return new Integer(storageValue.value)
	if (storageValue.subtype === 'Float') return new Float(storageValue.value)
	if (storageValue.subtype === 'PlusMinus') return new PlusMinus()

	// Variables
	if (storageValue.subtype === 'Variable') return new Variable(storageValue.symbol, storageValue.subscript, storageValue.accent)

	// Expression lists
	if (storageValue.subtype === 'Sum') return new Sum(storageValue.terms.map(storageValueToNode))
	if (storageValue.subtype === 'Product') return new Product(storageValue.terms.map(storageValueToNode))

	// Functions
	if (storageValue.subtype === 'Power') return new Power(storageValueToNode(storageValue.base), storageValueToNode(storageValue.exponent))
	if (storageValue.subtype === 'Fraction') return new Fraction(storageValueToNode(storageValue.numerator), storageValueToNode(storageValue.denominator))
	if (storageValue.subtype === 'Root') return new Root(storageValueToNode(storageValue.argument), storageValueToNode(storageValue.base))
	if (storageValue.subtype === 'Ln') return new Ln(storageValueToNode(storageValue.argument))

	// Fallback
	throw new Error(`Cannot deserialize expression storage value: the subtype of "${JSON.stringify(storageValue)}" has no known deserialization method.`)
}
