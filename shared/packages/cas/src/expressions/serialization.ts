import { type ExpressionNodeStorageValue, nodeToStorageValue, storageValueToNode } from '../core'

import { Expression } from './Expression'

export type SerializedExpression = {
	type: 'Expression'
	value: ExpressionNodeStorageValue
}

export function serializeExpression(expression: Expression): SerializedExpression {
	return { type: 'Expression', value: nodeToStorageValue(expression.node) }
}

export function deserializeExpression(serializedExpression: SerializedExpression): Expression {
	return new Expression(storageValueToNode(serializedExpression.value))
}
