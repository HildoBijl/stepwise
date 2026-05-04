import { fromKeys } from '@step-wise/utils'

import { ExpressionNode, Constant, PlusMinus, Variable, ExpressionList, Function } from '../nodes'

import type { ConstantStorageValue, VariableStorageValue, ExpressionListStorageValue, FunctionStorageValue, ExpressionNodeStorageValue } from './types'

export function nodeToStorageValue(node: ExpressionNode): ExpressionNodeStorageValue {
	if (node instanceof Constant) return constantToStorageValue(node)
	if (node instanceof PlusMinus) return { subtype: 'PlusMinus' }
	if (node instanceof Variable) return variableToStorageValue(node)
	if (node instanceof ExpressionList) return expressionListToStorageValue(node)
	if (node instanceof Function) return functionToStorageValue(node)

	throw new Error(`Cannot serialize expression node of subtype "${node.subtype}": the serialization method has not been implemented yet for this subtype.`)
}

function constantToStorageValue(node: Constant): ConstantStorageValue {
	return {
		subtype: node.subtype as ConstantStorageValue['subtype'],
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

function expressionListToStorageValue(node: ExpressionList): ExpressionListStorageValue {
	return {
		subtype: node.subtype as ExpressionListStorageValue['subtype'],
		terms: node.terms.map(nodeToStorageValue),
	}
}

function functionToStorageValue(node: Function): FunctionStorageValue {
	return {
		subtype: node.subtype as FunctionStorageValue['subtype'],
		...fromKeys(node.argumentNames, (_, index) => nodeToStorageValue(node.args[index])),
	} as FunctionStorageValue
}
