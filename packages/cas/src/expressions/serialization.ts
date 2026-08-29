import { hasOnlyKeys, isEmptyObject, isPlainObject, omitDefaults } from '@step-wise/js-utils'
import { isExpressionSettingsOptions } from '@step-wise/math-input-value'

import { isExpressionNodeStorageValue } from '../core/index.ts'

import { defaultExpressionSettings } from './settings.ts'
import { type ExpressionStorageValue, type SerializedExpression } from './types.ts'
import { ExpressionType, Expression } from './Expression.ts'

export function isExpressionStorageValue(value: unknown): value is ExpressionStorageValue {
	return isExpressionNodeStorageValue(value)
}

export function isSerializedExpression(value: unknown): value is SerializedExpression {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'value', 'settings']) && value.type === ExpressionType && isExpressionStorageValue(value.value) && (value.settings === undefined || isExpressionSettingsOptions(value.settings))
}

export function serializeExpression(expression: Expression): SerializedExpression {
	const serialized: SerializedExpression = { type: ExpressionType, value: expression.toStorageValue() }
	const settings = omitDefaults(expression.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeExpression(serializedExpression: unknown): Expression {
	if (!isSerializedExpression(serializedExpression)) throw new TypeError(`Invalid serialized Expression.`)
	return Expression.fromStorageValue(serializedExpression.value, serializedExpression.settings)
}