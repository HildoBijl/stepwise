import { isEmptyObject, omitDefaults } from '@step-wise/utils'

import { defaultExpressionSettings } from './settingsReexport'
import { type SerializedExpression } from './types'
import { Expression } from './Expression'

export function serializeExpression(expression: Expression): SerializedExpression {
	const serialized: SerializedExpression = { type: 'Expression', value: expression.toStorageValue() }
	const settings = omitDefaults(expression.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeExpression(serializedExpression: SerializedExpression): Expression {
	return Expression.fromStorageValue(serializedExpression.value, serializedExpression.settings)
}
