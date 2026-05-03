import { ExpressionNode, Integer, Float, Variable } from '../nodes'

import { ExpressionNodeStorageValue } from './types'

export function storageValueToNode(storageValue: ExpressionNodeStorageValue): ExpressionNode {
	// Constants
	if (storageValue.subtype === 'Integer') return new Integer(storageValue.value)
	if (storageValue.subtype === 'Float') return new Float(storageValue.value)

	// Variables
	if (storageValue.subtype === 'Variable') return new Variable(storageValue.symbol, storageValue.subscript, storageValue.accent)

	// Functions


	// Fallback
	throw new Error(`Cannot deserialize expression storage value: the subtype of "${JSON.stringify(storageValue)}" has no known deserialization method.`)
}
