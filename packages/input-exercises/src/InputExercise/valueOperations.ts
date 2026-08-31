import { interpretInputData, toInputValue } from '@step-wise/input-interpretation'
import { type ValueTypes, combineValueTypes, createAreValuesEqual, extractValueTypeAdapters, fundamentalValueTypes } from '@step-wise/value-types'

import type { InputExerciseInput, InputExerciseParameters, ValueOperations } from './types.ts'
import { deserializeInputExerciseParameters, serializeInputExerciseParameters } from './parameterSerialization.ts'

type InputExerciseValueInfrastructure = {
	valueOperations: ValueOperations
	serializeParameters: (parameters: InputExerciseParameters) => ReturnType<typeof serializeInputExerciseParameters>
}

export function createValueInfrastructure(valueTypes: ValueTypes = {}): InputExerciseValueInfrastructure {
	const adapters = extractValueTypeAdapters(combineValueTypes(fundamentalValueTypes, valueTypes))
	const valueOperations: ValueOperations = {
		deserializeParameters: parameters => deserializeInputExerciseParameters(parameters, adapters.serializationAdapters),
		interpretInput: input => interpretInputData(input, adapters.inputValueAdapters) as InputExerciseInput,
		toInputValue: (value, type) => toInputValue(value, type, adapters.inputValueAdapters),
		areValuesEqual: createAreValuesEqual(adapters.equalityAdapters),
	}
	return {
		valueOperations,
		serializeParameters: parameters => serializeInputExerciseParameters(parameters, adapters.serializationAdapters),
	}
}
