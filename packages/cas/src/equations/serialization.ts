import { isEmptyObject, omitDefaults } from '@step-wise/js-utils'

import { defaultExpressionSettings } from '../expressions'

import { type SerializedEquation } from './types'
import { EquationType, Equation } from './Equation'

export function serializeEquation(equation: Equation): SerializedEquation {
	const serialized: SerializedEquation = { type: 'Equation', value: equation.toStorageValue() }
	const settings = omitDefaults(equation.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeEquation(serializedEquation: SerializedEquation): Equation {
	if (serializedEquation.type !== EquationType) throw new TypeError(`Invalid serialized Equation: expected type "${EquationType}".`)
	return Equation.fromStorageValue(serializedEquation.value, serializedEquation.settings)
}
