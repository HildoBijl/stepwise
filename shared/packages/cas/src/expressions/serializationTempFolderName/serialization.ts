import { ExpressionNode, Constant, Variable } from '../nodes'

import type { ConstantStorageValue, VariableStorageValue, ExpressionNodeStorageValue } from './types'

export function nodeToStorageValue(node: ExpressionNode): ExpressionNodeStorageValue {
	if (node instanceof Constant) return constantToStorageValue(node)
	if (node instanceof Variable) return variableToStorageValue(node)

	throw new Error(`Cannot serialize expression node of subtype "${node.subtype}": the serialization method has not been implemented yet for this subtype.`)
}

function constantToStorageValue(node: Constant): ConstantStorageValue {
	return { subtype: node.subtype as ConstantStorageValue['subtype'], value: node.value }
}

export function variableToStorageValue(node: Variable): VariableStorageValue {
	return {
		subtype: node.subtype,
		symbol: node.symbol,
		...(node.subscript === undefined ? {} : { subscript: node.subscript }),
		...(node.accent === undefined ? {} : { accent: node.accent }),
	}
}
