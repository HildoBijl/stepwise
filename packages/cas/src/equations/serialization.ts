import { hasOnlyKeys, isEmptyObject, isPlainObject, omitDefaults } from '@step-wise/js-utils'
import { isExpressionSettingsOptions } from '@step-wise/math-input-value'

import { defaultExpressionSettings } from '../expressions/index.ts'

import { type SerializedEquation } from './types.ts'
import { EquationType, Equation } from './Equation.ts'

export function isSerializedEquation(value: unknown): value is SerializedEquation {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['type', 'value', 'settings']) || value.type !== EquationType || !Object.hasOwn(value, 'value')) return false
	const settings = value.settings
	if (settings !== undefined && !isExpressionSettingsOptions(settings)) return false
	try {
		Equation.fromStorageValue(value.value as SerializedEquation['value'], settings)
		return true
	} catch {
		return false
	}
}

export function serializeEquation(equation: Equation): SerializedEquation {
	const serialized: SerializedEquation = { type: 'Equation', value: equation.toStorageValue() }
	const settings = omitDefaults(equation.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeEquation(serializedEquation: unknown): Equation {
	if (!isPlainObject(serializedEquation) || serializedEquation.type !== EquationType || !Object.hasOwn(serializedEquation, 'value')) throw new TypeError(`Invalid serialized Equation: expected type "Equation" and a value.`)
	const settings = serializedEquation.settings
	if (settings !== undefined && !isExpressionSettingsOptions(settings)) throw new TypeError(`Invalid serialized Equation settings.`)
	return Equation.fromStorageValue(serializedEquation.value as SerializedEquation['value'], settings)
}
