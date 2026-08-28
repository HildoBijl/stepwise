import { isEmptyObject, omitDefaults } from '@step-wise/js-utils'

import { defaultExpressionSettings } from './settings.ts'
import { type SerializedExpression } from './types.ts'
import { ExpressionType, Expression } from './Expression.ts'

export function serializeExpression(expression: Expression): SerializedExpression {
	const serialized: SerializedExpression = { type: 'Expression', value: expression.toStorageValue() }
	const settings = omitDefaults(expression.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeExpression(serializedExpression: SerializedExpression): Expression {
	if (serializedExpression.type !== ExpressionType) throw new TypeError(`Invalid serialized Expression: expected type "${ExpressionType}".`)
	return Expression.fromStorageValue(serializedExpression.value, serializedExpression.settings)
}
