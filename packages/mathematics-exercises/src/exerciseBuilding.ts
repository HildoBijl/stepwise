import type { ValueTypes } from '@step-wise/value-types'
import type { InputExerciseParameters, InputExerciseSolution, MonoExercise, MonoExerciseSpec, StepExercise, StepExerciseSpec } from '@step-wise/input-exercises'
import { combineValueTypes } from '@step-wise/value-types'
import { mathematicsValueTypes } from '@step-wise/mathematics-value-types'
import { buildMonoExercise as buildBaseMonoExercise, buildStepExercise as buildBaseStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'

export function buildMonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>): MonoExercise<TParameters, TSolution> {
	return buildBaseMonoExercise({ ...spec, valueTypes: addMathematicsValueTypes(spec.valueTypes) })
}

export function buildStepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>): StepExercise<TParameters, TSolution> {
	return buildBaseStepExercise({ ...spec, valueTypes: addMathematicsValueTypes(spec.valueTypes) })
}

function addMathematicsValueTypes(valueTypes?: ValueTypes): ValueTypes {
	return valueTypes === undefined ? mathematicsValueTypes : combineValueTypes(mathematicsValueTypes, valueTypes)
}

export { createStepExerciseMetadata }
