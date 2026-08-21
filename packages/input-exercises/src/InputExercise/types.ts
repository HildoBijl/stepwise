import type { InputValue } from '@step-wise/input-interpretation'
import type { Exercise, ExerciseAction, ExerciseHistory, ExerciseMetaData, ExerciseMode, ExerciseProgress, GroupExerciseReducer, GroupExerciseSubmission, SoloExerciseReducer, UpdateSkills } from '@step-wise/exercise-definition'
import type { PlainDataObject } from '@step-wise/js-utils'

/*
 * Fundamentals
 */

// Meta data: extend with comparison options.
export type InputExerciseMetaData = ExerciseMetaData & { compare?: Record<string, unknown> }

// Actions: only allow input and giveUp actions.
export type InputExerciseInputValue = Record<string, InputValue>
export type InputExerciseAction = { type: 'input', input: InputExerciseInputValue } | { type: 'giveUp' }
export type InputExerciseActionType = InputExerciseAction['type']

// State and input: runtime objects obtained after deserialization and interpretation.
export type InputExerciseState = Record<string, unknown>
export type InputExerciseInput = Record<string, unknown>

/*
 * Solution definition
 */

// Solution function: to generate a solution object from the state.
export type Solution = Record<string, unknown>
export type GetSolutionFunction<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution> = (state: TState) => TSolution

// Solution object: in case the solution depends on the user input, set up a dynamic solution based on input dependencies.
export type GetStaticSolution<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution> = (state: TState) => Partial<TSolution>
export type InputDependency = unknown
export type GetInputDependency<TSolution extends Solution = Solution, TInputDependency = InputDependency> = (input: InputExerciseInput, staticSolution: Partial<TSolution>) => TInputDependency
export type GetDynamicSolution<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution, TInputDependency = InputDependency> = (inputDependency: TInputDependency, staticSolution: Partial<TSolution>, state: TState) => Partial<TSolution>
export type GetSolutionObject<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution, TInputDependency = InputDependency> = {
	getStaticSolution: GetStaticSolution<TState, TSolution>
	dependentFields?: string[]
	getInputDependency?: GetInputDependency<TSolution, TInputDependency>
	getDynamicSolution?: GetDynamicSolution<TState, TSolution, TInputDependency>
}

// Solution: joining the solution function and the solution object.
export type GetSolution<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution, TInputDependency = InputDependency> = GetSolutionFunction<TState, TSolution> | GetSolutionObject<TState, TSolution, TInputDependency>

/*
 * Full exercise definition
 */

// Input exercise spec: what authors define before a concrete exercise builder adds the mode-specific reducers.
export type InputExerciseSpec<TMetaData extends InputExerciseMetaData, TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution> = {
	metaData: TMetaData
	generateState?: (example: boolean) => TState
	getSolution?: GetSolution<TState, TSolution>
}

// Internal reducer inputs use the deserialized runtime state, while actions and progress remain plain data.
type InputExerciseReducerGeneralInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends InputExerciseState> = {
	progress: TProgress
	state: TState
	updateSkills?: UpdateSkills
}
export type InputExerciseReducerSubmissionsInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends InputExerciseState> = InputExerciseReducerGeneralInput<TAction, TProgress, TState> & {
	mode: ExerciseMode
	history: ExerciseHistory<TAction, TProgress>
	submissions: readonly GroupExerciseSubmission<TAction>[]
}

// Input exercise: its public generator and reducer use stored data; author-facing callbacks use deserialized state.
export type InputExercise<TMetaData extends InputExerciseMetaData, TAction extends InputExerciseAction, TProgress extends ExerciseProgress, TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution> = Exercise<TMetaData, TAction, TProgress> & Omit<InputExerciseSpec<TMetaData, TState, TSolution>, 'generateState'> & {
	generateState: (example: boolean) => PlainDataObject
	processSoloAction: SoloExerciseReducer<TAction, TProgress>
	processGroupActions: GroupExerciseReducer<TAction, TProgress>
}

/*
 * Input for the CheckInput function to be implemented by child components
 */

export type CheckInputData<TMetaData extends InputExerciseMetaData = InputExerciseMetaData, TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution> = {
	metaData: TMetaData
	state: TState
	rawInput: InputExerciseInputValue
	input: InputExerciseInput
	solution?: TSolution
}
