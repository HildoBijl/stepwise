import type { ValueTypes } from '@step-wise/value-types'
import type { InputDependency, InputExerciseParameters, InputExerciseSolution, MonoExercise, MonoExerciseSpec, StepExercise, StepExerciseSpec } from '@step-wise/input-exercises'
import { combineValueTypes } from '@step-wise/value-types'
import { buildMonoExercise as buildBaseMonoExercise, buildStepExercise as buildBaseStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'

export function createExerciseBuilders(defaultValueTypes: ValueTypes) {
	return {
		buildMonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(spec: MonoExerciseSpec<TParameters, TSolution, TInputDependency>): MonoExercise<TParameters, TSolution, TInputDependency> {
			return buildBaseMonoExercise({ ...spec, valueTypes: addValueTypes(defaultValueTypes, spec.valueTypes) })
		},
		buildStepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>): StepExercise<TParameters, TSolution, TInputDependency> {
			return buildBaseStepExercise({ ...spec, valueTypes: addValueTypes(defaultValueTypes, spec.valueTypes) })
		},
	}
}

function addValueTypes(defaultValueTypes: ValueTypes, valueTypes?: ValueTypes): ValueTypes {
	return valueTypes === undefined ? defaultValueTypes : combineValueTypes(defaultValueTypes, valueTypes)
}

export { createStepExerciseMetadata }
