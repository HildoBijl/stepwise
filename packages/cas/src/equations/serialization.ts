import { hasOnlyKeys, isEmptyObject, isPlainObject, omitDefaults } from '@step-wise/js-utils'
import { isExpressionSettingsOptions } from '@step-wise/math-input-value'

import { defaultExpressionSettings, isExpressionStorageValue } from '../expressions/index.ts'

import { type EquationStorageValue, type SerializedEquation } from './types.ts'
import { EquationType, Equation } from './Equation.ts'

export function isEquationStorageValue(value: unknown): value is EquationStorageValue {
	return isPlainObject(value) && hasOnlyKeys(value, ['left', 'right']) && isExpressionStorageValue(value.left) && isExpressionStorageValue(value.right)
}

export function isSerializedEquation(value: unknown): value is SerializedEquation {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'value', 'settings']) && value.type === EquationType && isEquationStorageValue(value.value) && (value.settings === undefined || isExpressionSettingsOptions(value.settings))
}

export function serializeEquation(equation: Equation): SerializedEquation {
	const serialized: SerializedEquation = { type: EquationType, value: equation.toStorageValue() }
	const settings = omitDefaults(equation.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeEquation(serializedEquation: unknown): Equation {
	if (!isSerializedEquation(serializedEquation)) throw new TypeError(`Invalid serialized Equation.`)
	return Equation.fromStorageValue(serializedEquation.value, serializedEquation.settings)
}
