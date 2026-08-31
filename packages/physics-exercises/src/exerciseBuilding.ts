import type { ValueTypes } from '@step-wise/value-types'
import type { InputExerciseParameters, InputExerciseSolution, MonoExercise, MonoExerciseSpec, StepExercise, StepExerciseSpec } from '@step-wise/input-exercises'
import { combineValueTypes, generateMultipleChoiceMapping } from '@step-wise/value-types'
import { physicsValueTypes } from '@step-wise/physics-value-types'
import { buildMonoExercise as buildBaseMonoExercise, buildStepExercise as buildBaseStepExercise, createStepExerciseMetadata, getInput } from '@step-wise/input-exercises'

export function buildMonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>): MonoExercise<TParameters, TSolution> {
	return buildBaseMonoExercise({ ...spec, valueTypes: addPhysicsValueTypes(spec.valueTypes) })
}

export function buildStepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>): StepExercise<TParameters, TSolution> {
	return buildBaseStepExercise({ ...spec, valueTypes: addPhysicsValueTypes(spec.valueTypes) })
}

function addPhysicsValueTypes(valueTypes?: ValueTypes): ValueTypes {
	return valueTypes === undefined ? physicsValueTypes : combineValueTypes(physicsValueTypes, valueTypes)
}

export { createStepExerciseMetadata, generateMultipleChoiceMapping, getInput }
