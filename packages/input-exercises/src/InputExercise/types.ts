import type { InputValue } from '@step-wise/input-interpretation'
import type { BaseExerciseInstanceByMode, Exercise, ExerciseMetadata, ExerciseMode, ExerciseState, GroupExerciseReducer, SoloExerciseReducer } from '@step-wise/exercise-definition'
import type { PlainDataObject } from '@step-wise/js-utils'

/*
 * Fundamentals
 */

// Metadata: extend with comparison options.
export type InputExerciseMetadata = ExerciseMetadata & { comparisons?: Record<string, unknown> }

// Actions: only allow input and giveUp actions.
export type InputExerciseRawInput = Record<string, InputValue>
export type InputExerciseAction = { type: 'input', input: InputExerciseRawInput } | { type: 'giveUp' }
export type InputExerciseActionType = InputExerciseAction['type']

// Parameters and input: runtime objects obtained after deserialization and interpretation.
export type InputExerciseParameters = Record<string, unknown>
export type InputExerciseInput = Record<string, unknown>
export type InputExerciseAttemptState = Partial<{
	attempted: true
	attemptedBy: string[]
}>
export type InputExerciseHistoryInstance<TState extends ExerciseState = ExerciseState> = {
	[Mode in ExerciseMode]: Pick<BaseExerciseInstanceByMode<InputExerciseAction, TState>[Mode], 'mode' | 'initialState' | 'history'>
}[ExerciseMode]

/*
 * Solution definition
 */

// A solution generator derives the full solution from the parameters.
export type InputExerciseSolution = Record<string, unknown>
export type SolutionGenerator<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = (parameters: TParameters) => TSolution

// A dynamic solution definition combines a static solution with fields derived from the input.
export type StaticSolutionGenerator<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = (parameters: TParameters) => Partial<TSolution>
export type InputDependency = unknown
export type InputDependencyResolver<TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = (input: InputExerciseInput, staticSolution: Partial<TSolution>) => TInputDependency
export type DynamicSolutionGenerator<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = (inputDependency: TInputDependency, staticSolution: Partial<TSolution>, parameters: TParameters) => Partial<TSolution>
export type DynamicSolutionDefinition<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = {
	getStaticSolution: StaticSolutionGenerator<TParameters, TSolution>
	dependentFields?: string[]
	getInputDependency?: InputDependencyResolver<TSolution, TInputDependency>
	getDynamicSolution?: DynamicSolutionGenerator<TParameters, TSolution, TInputDependency>
}

// A solution can be defined by either a generator function or a dynamic solution definition.
export type SolutionDefinition<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = SolutionGenerator<TParameters, TSolution> | DynamicSolutionDefinition<TParameters, TSolution, TInputDependency>

/*
 * Full exercise definition
 */

// Input exercise spec: what authors define before a concrete exercise builder adds the mode-specific reducers.
export type InputExerciseSpec<TMetadata extends InputExerciseMetadata, TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = {
	metadata: TMetadata
	generateParameters?: (example: boolean) => TParameters
	getSolution?: SolutionDefinition<TParameters, TSolution>
}

// Input exercise: its public generator and reducer use stored data; author-facing callbacks use deserialized parameters.
export type InputExercise<TMetadata extends InputExerciseMetadata, TAction extends InputExerciseAction, TState extends ExerciseState, TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = Exercise<TMetadata, TAction, TState> & Omit<InputExerciseSpec<TMetadata, TParameters, TSolution>, 'generateParameters'> & {
	generateParameters: (example: boolean) => PlainDataObject
	getInitialState: (parameters: PlainDataObject) => TState
	processSoloAction: SoloExerciseReducer<TAction, TState>
	processGroupActions: GroupExerciseReducer<TAction, TState>
}

/*
 * Input for the CheckInput function to be implemented by child components
 */

export type CheckInputData<TMetadata extends InputExerciseMetadata = InputExerciseMetadata, TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = {
	metadata: TMetadata
	parameters: TParameters
	rawInput: InputExerciseRawInput
	input: InputExerciseInput
	solution?: TSolution
}
