import { fromKeys } from '@step-wise/utils'

import { ExpressionNode, ConstantNode, PlusMinus, Variable, ListNode, FunctionNode } from '../nodes'

import type { ConstantNodeStorageValue, VariableStorageValue, ListNodeStorageValue, FunctionNodeStorageValue, ExpressionNodeStorageValue } from './types'

export function nodeToStorageValue(node: ExpressionNode): ExpressionNodeStorageValue {
	if (node instanceof ConstantNode) return constantToStorageValue(node)
	if (node instanceof PlusMinus) return { subtype: 'PlusMinus' }
	if (node instanceof Variable) return variableToStorageValue(node)
	if (node instanceof ListNode) return expressionListToStorageValue(node)
	if (node instanceof FunctionNode) return functionToStorageValue(node)

	throw new Error(`Cannot serialize expression node of subtype "${node.subtype}": the serialization method has not been implemented yet for this subtype.`)
}

function constantToStorageValue(node: ConstantNode): ConstantNodeStorageValue {
	return {
		subtype: node.subtype as ConstantNodeStorageValue['subtype'],
		value: node.value,
	}
}

function variableToStorageValue(node: Variable): VariableStorageValue {
	return {
		subtype: node.subtype,
		symbol: node.symbol,
		...(node.subscript === undefined ? {} : { subscript: node.subscript }),
		...(node.accent === undefined ? {} : { accent: node.accent }),
	}
}

function expressionListToStorageValue(node: ListNode): ListNodeStorageValue {
	return {
		subtype: node.subtype as ListNodeStorageValue['subtype'],
		terms: node.terms.map(nodeToStorageValue),
	}
}

function functionToStorageValue(node: FunctionNode): FunctionNodeStorageValue {
	return {
		subtype: node.subtype as FunctionNodeStorageValue['subtype'],
		...fromKeys(node.argumentNames, (_, index) => nodeToStorageValue(node.args[index])),
	} as FunctionNodeStorageValue
}
