import { isEmptyObject, omitDefaults } from '@step-wise/utils'

import { defaultExpressionSettings } from '../expressions'

import { type SerializedEquation } from './types'
import { Equation } from './Equation'

export function serializeEquation(equation: Equation): SerializedEquation {
	const serialized: SerializedEquation = { type: 'Equation', value: equation.toStorageValue() }
	const settings = omitDefaults(equation.settings, defaultExpressionSettings)
	if (!isEmptyObject(settings)) serialized.settings = settings
	return serialized
}

export function deserializeEquation(serializedEquation: SerializedEquation): Equation {
	return Equation.fromStorageValue(serializedEquation.value, serializedEquation.settings)
}
