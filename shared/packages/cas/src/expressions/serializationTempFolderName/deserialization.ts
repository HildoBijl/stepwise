import { ExpressionNode, Integer } from '../nodes'

import { ExpressionNodeStorageValue } from './types'

export function storageValueToNode(storageValue: ExpressionNodeStorageValue): ExpressionNode {
	if (storageValue.subtype === 'Integer') return new Integer(storageValue.value)

	throw new Error(`Cannot deserialize expression storage value of subtype "${storageValue.subtype}".`)
}
