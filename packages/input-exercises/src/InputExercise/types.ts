import type { Awaitable, PlainDataObject } from '@step-wise/js-utils'
import type { Exercise, ExerciseMetadata, ExerciseState, GroupExerciseReducer, SoloExerciseReducer } from '@step-wise/exercise-definition'
import type { SerializedData } from '@step-wise/serialization'
import type { InputValue } from '@step-wise/input-interpretation'
import type { ValueTypes } from '@step-wise/value-types'

/*
 * Fundamentals
 */

// Metadata: extend with comparison options.
export type InputExerciseMetadata = ExerciseMetadata & { comparisons?: Record<string, unknown> }

// Actions: only allow input and giveUp actions.
export type InputExerciseRawInput = Record<string, InputValue>
export type InputExerciseAction = { type: 'input', input: InputExerciseRawInput, adoptUserHistory?: string } | { type: 'giveUp' }
export type InputExerciseActionType = InputExerciseAction['type']

// Parameters and input: runtime objects obtained after deserialization and interpretation.
export type InputExerciseParameters = Record<string, unknown>
export type InputExerciseInput = Record<string, unknown>

// Reports: solo exercises have one report per transition; group exercises may have one per user.
export type InputExerciseReport = PlainDataObject
export type SoloInputExerciseReport = InputExerciseReport
export type GroupInputExerciseReport = Record<string, InputExerciseReport>
export type CheckInputResult = boolean | { correct: boolean, report?: InputExerciseReport }

/*
 * Solution generation
 */

// Updating input dependencies: the part of the state depending on the input that may change the solution.
export type InputDependency = unknown
export type UpdateInputDependencyData<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = {
	parameters: TParameters
	previousInputDependency: TInputDependency | undefined
	staticSolution: Partial<TSolution>
	input: InputExerciseInput
	step: number
}
export type UpdateInputDependency<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = (data: UpdateInputDependencyData<TParameters, TSolution, TInputDependency>) => Awaitable<TInputDependency | undefined>

// Generating the solution: a useful object for checking input and rendering exercises.
export type InputExerciseSolution = Record<string, unknown>
export type GetStaticSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = (parameters: TParameters) => Awaitable<Partial<TSolution>>
export type GetSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = (parameters: TParameters, inputDependency: TInputDependency | undefined, staticSolution: Partial<TSolution>) => Awaitable<Partial<TSolution>>

/*
 * Full exercise definition
 */

// Input exercise spec: what authors define before a concrete exercise builder adds the mode-specific reducers.
export type InputExerciseSpec<TMetadata extends InputExerciseMetadata, TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = {
	metadata: TMetadata
	valueTypes?: ValueTypes
	generateParameters?: (example: boolean) => Awaitable<TParameters>
	updateInputDependency?: UpdateInputDependency<TParameters, TSolution, TInputDependency>
	getStaticSolution?: GetStaticSolution<TParameters, TSolution>
	getSolution?: GetSolution<TParameters, TSolution, TInputDependency>
}

// Operations for handling different value types in the exercise.
export type InputExerciseValueOperations = {
	serialize: (value: unknown) => SerializedData
	deserialize: (value: unknown) => unknown
	interpretInput: (input: InputExerciseRawInput) => InputExerciseInput
	toInputValue: (value: unknown, type: string) => InputValue
	areValuesEqual: (type: string, inputValue: unknown, expectedValue: unknown, options?: unknown) => boolean
}

// Input exercise: its public generator and reducer use stored data; author-facing callbacks use deserialized parameters.
export type InputExercise<TMetadata extends InputExerciseMetadata, TAction extends InputExerciseAction, TState extends ExerciseState, TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = Exercise<TMetadata, TAction, TState, PlainDataObject, SoloInputExerciseReport, GroupInputExerciseReport> & Omit<InputExerciseSpec<TMetadata, TParameters, TSolution, TInputDependency>, 'generateParameters' | 'valueTypes'> & {
	valueOperations: InputExerciseValueOperations
	generateParameters: (example: boolean) => Promise<PlainDataObject>
	getInitialState: (parameters: PlainDataObject) => Awaitable<TState>
	processSoloAction: SoloExerciseReducer<TAction, TState, PlainDataObject, SoloInputExerciseReport>
	processGroupActions: GroupExerciseReducer<TAction, TState, PlainDataObject, GroupInputExerciseReport>
}

/*
 * Input for the CheckInput function to be implemented by child components
 */

export type CheckInputData<TMetadata extends InputExerciseMetadata = InputExerciseMetadata, TParameters extends InputExerciseParameters = InputExerciseParameters, TInputDependency = InputDependency, TSolution extends InputExerciseSolution = InputExerciseSolution> = {
	metadata: TMetadata
	parameters: TParameters
	rawInput: InputExerciseRawInput
	input: InputExerciseInput
	inputDependency: TInputDependency | undefined
	solution?: TSolution
	areValuesEqual: InputExerciseValueOperations['areValuesEqual']
}
