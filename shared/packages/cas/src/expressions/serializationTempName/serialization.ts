import { fromKeys } from '@step-wise/utils'

import { ExpressionNode, Constant, PlusMinus, Variable, ExpressionList, Function } from '../nodes'

import type { ConstantNodeStorageValue, VariableStorageValue, ListNodeStorageValue, FunctionNodeStorageValue, ExpressionNodeStorageValue } from './types'

export function nodeToStorageValue(node: ExpressionNode): ExpressionNodeStorageValue {
	if (node instanceof Constant) return constantToStorageValue(node)
	if (node instanceof PlusMinus) return { subtype: 'PlusMinus' }
	if (node instanceof Variable) return variableToStorageValue(node)
	if (node instanceof ExpressionList) return expressionListToStorageValue(node)
	if (node instanceof Function) return functionToStorageValue(node)

	throw new Error(`Cannot serialize expression node of subtype "${node.subtype}": the serialization method has not been implemented yet for this subtype.`)
}

function constantToStorageValue(node: Constant): ConstantNodeStorageValue {
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

function expressionListToStorageValue(node: ExpressionList): ListNodeStorageValue {
	return {
		subtype: node.subtype as ListNodeStorageValue['subtype'],
		terms: node.terms.map(nodeToStorageValue),
	}
}

function functionToStorageValue(node: Function): FunctionNodeStorageValue {
	return {
		subtype: node.subtype as FunctionNodeStorageValue['subtype'],
		...fromKeys(node.argumentNames, (_, index) => nodeToStorageValue(node.args[index])),
	} as FunctionNodeStorageValue
}
