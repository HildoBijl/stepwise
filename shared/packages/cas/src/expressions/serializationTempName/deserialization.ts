import { ExpressionNode, Integer, Float, PlusMinus, Variable, Sum, Product } from '../nodes'

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


	// Fallback
	throw new Error(`Cannot deserialize expression storage value: the subtype of "${JSON.stringify(storageValue)}" has no known deserialization method.`)
}
