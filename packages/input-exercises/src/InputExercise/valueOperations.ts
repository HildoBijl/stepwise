import { deserializeData, serializeData } from '@step-wise/serialization'
import { interpretInputData, toInputValue } from '@step-wise/input-interpretation'
import { createAreValuesEqual } from '@step-wise/value-equality'
import { type ValueTypes, combineValueTypes, extractValueTypeAdapters, fundamentalValueTypes } from '@step-wise/value-types'

import type { InputExerciseInput, InputExerciseValueOperations } from './types.ts'

export function createInputExerciseValueOperations(valueTypes: ValueTypes = {}): InputExerciseValueOperations {
	const adapters = extractValueTypeAdapters(combineValueTypes(fundamentalValueTypes, valueTypes))
	return {
		serialize: value => serializeData(value, adapters.serializationAdapters),
		deserialize: value => deserializeData(value, adapters.serializationAdapters),
		interpretInput: input => interpretInputData(input, adapters.inputValueAdapters) as InputExerciseInput,
		toInputValue: (value, type) => toInputValue(value, type, adapters.inputValueAdapters),
		areValuesEqual: createAreValuesEqual(adapters.equalityAdapters),
	}
}
