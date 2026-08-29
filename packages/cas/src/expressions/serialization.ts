import { hasOnlyKeys, isEmptyObject, isPlainObject, omitDefaults } from '@step-wise/js-utils'
import { isExpressionSettingsOptions } from '@step-wise/math-input-value'

import { defaultExpressionSettings } from './settings.ts'
import { type SerializedExpression } from './types.ts'
import { ExpressionType, Expression } from './Expression.ts'

export function isSerializedExpression(value: unknown): value is SerializedExpression {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['type', 'value', 'settings']) || value.type !== ExpressionType || !Object.hasOwn(value, 'value')) return false
	const settings = value.settings
	if (settings !== undefined && !isExpressionSettingsOptions(settings)) return false
	try {
		Expression.fromStorageValue(value.value as SerializedExpression['value'], settings)
		return true
	} catch {
		return false
	}
}

export function serializeExpression(expression: Expression): SerializedExpression {
	const serialized: SerializedExpression = { type: 'Expression', value: expression.toStorageValue() }
	const settings = omitDefaults(expression.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeExpression(serializedExpression: unknown): Expression {
	if (!isPlainObject(serializedExpression) || serializedExpression.type !== ExpressionType || !Object.hasOwn(serializedExpression, 'value')) throw new TypeError(`Invalid serialized Expression: expected type "Expression" and a value.`)
	const settings = serializedExpression.settings
	if (settings !== undefined && !isExpressionSettingsOptions(settings)) throw new TypeError(`Invalid serialized Expression settings.`)
	return Expression.fromStorageValue(serializedExpression.value as SerializedExpression['value'], settings)
}
