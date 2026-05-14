import { fromKeys } from '@step-wise/utils'

import type { ExpressionNode, ConstantNode, Sign, Variable, ListNode, FunctionNode } from '../../construction'
import { isConstantNode, isSignNode, isVariable, isListNode, isFunctionNode, isIntegerNode, isFloatNode, isNamedConstant } from '../../operations'

import type { ConstantNodeStorageValue, SignNodeStorageValue, VariableStorageValue, ListNodeStorageValue, FunctionNodeStorageValue, ExpressionNodeStorageValue } from './types'

export function nodeToStorageValue(node: ExpressionNode): ExpressionNodeStorageValue {
	if (isConstantNode(node)) return constantToStorageValue(node)
	if (isSignNode(node)) return signToStorageValue(node)
	if (isVariable(node)) return variableToStorageValue(node)
	if (isListNode(node)) return expressionListToStorageValue(node)
	if (isFunctionNode(node)) return functionToStorageValue(node)

	throw new Error(`Cannot serialize expression node of subtype "${node.subtype}": the serialization method has not been implemented yet for this subtype.`)
}

function constantToStorageValue(node: ConstantNode): ConstantNodeStorageValue {
	if (isIntegerNode(node)) return { subtype: node.subtype, value: node.value }
	if (isFloatNode(node)) return { subtype: node.subtype, value: node.value }
	if (isNamedConstant(node)) return { subtype: node.subtype, symbol: node.symbol }
	throw new Error(`Invalid node type: cannot serialize node of type "${node.subtype}".`)
}

function signToStorageValue(node: Sign): SignNodeStorageValue {
	return { subtype: node.subtype as SignNodeStorageValue['subtype'], node: nodeToStorageValue(node.node) }
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
