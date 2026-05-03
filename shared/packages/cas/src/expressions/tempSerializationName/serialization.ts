import { ExpressionNode, Constant } from '../nodes'

import type { ConstantStorageValue, ExpressionNodeStorageValue } from './types'

export function nodeToStorageValue(node: ExpressionNode): ExpressionNodeStorageValue {
	if (node instanceof Constant)	return constantToStorageValue(node)

	throw new Error(`Cannot serialize expression node of subtype "${node.subtype}".`)
}

export function constantToStorageValue(node: Constant): ConstantStorageValue {
	return { subtype: node.subtype as ConstantStorageValue['subtype'],	value: node.value	}
}
console.log('Test', nodeToStorageValue)