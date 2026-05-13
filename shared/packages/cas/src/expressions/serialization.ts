import { isEmptyObject, omitDefaults } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNodeStorageValue } from '../core'

import { } from '../core'
import { Expression } from './Expression'

export type SerializedExpression = {
	type: 'Expression'
	value: ExpressionNodeStorageValue
	settings?: Partial<ExpressionSettings>
}

export function serializeExpression(expression: Expression): SerializedExpression {
	const serialized: SerializedExpression = { type: 'Expression', value: expression.toStorageValue() }
	const settings = omitDefaults(expression.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeExpression(serializedExpression: SerializedExpression): Expression {
	return Expression.fromStorageValue(serializedExpression.value, serializedExpression.settings)
}
