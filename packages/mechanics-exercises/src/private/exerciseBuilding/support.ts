import type { ValueTypes } from '@step-wise/value-types'
import type { InputExerciseParameters, InputExerciseSolution, MonoExercise, MonoExerciseSpec, StepExercise, StepExerciseSpec } from '@step-wise/input-exercises'
import { combineValueTypes } from '@step-wise/value-types'
import { buildMonoExercise as buildBaseMonoExercise, buildStepExercise as buildBaseStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'

export function createExerciseBuilders(defaultValueTypes: ValueTypes) {
	return {
		buildMonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>): MonoExercise<TParameters, TSolution> {
			return buildBaseMonoExercise({ ...spec, valueTypes: addValueTypes(defaultValueTypes, spec.valueTypes) })
		},
		buildStepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>): StepExercise<TParameters, TSolution> {
			return buildBaseStepExercise({ ...spec, valueTypes: addValueTypes(defaultValueTypes, spec.valueTypes) })
		},
	}
}

function addValueTypes(defaultValueTypes: ValueTypes, valueTypes?: ValueTypes): ValueTypes {
	return valueTypes === undefined ? defaultValueTypes : combineValueTypes(defaultValueTypes, valueTypes)
}

export { createStepExerciseMetadata }
