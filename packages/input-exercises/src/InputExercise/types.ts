import type { InputValue } from '@step-wise/input-interpretation'
import type { Exercise, ExerciseAction, ExerciseHistory, ExerciseMetaData, ExerciseMode, ExerciseState, GroupExerciseReducer, GroupExerciseSubmission, SoloExerciseReducer, UpdateSkills } from '@step-wise/exercise-definition'
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

// Parameters and input: runtime objects obtained after deserialization and interpretation.
export type InputExerciseParameters = Record<string, unknown>
export type InputExerciseInput = Record<string, unknown>

/*
 * Solution definition
 */

// Solution function: to generate a solution object from the parameters.
export type Solution = Record<string, unknown>
export type GetSolutionFunction<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = (parameters: TParameters) => TSolution

// Solution object: in case the solution depends on the user input, set up a dynamic solution based on input dependencies.
export type GetStaticSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = (parameters: TParameters) => Partial<TSolution>
export type InputDependency = unknown
export type GetInputDependency<TSolution extends Solution = Solution, TInputDependency = InputDependency> = (input: InputExerciseInput, staticSolution: Partial<TSolution>) => TInputDependency
export type GetDynamicSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution, TInputDependency = InputDependency> = (inputDependency: TInputDependency, staticSolution: Partial<TSolution>, parameters: TParameters) => Partial<TSolution>
export type GetSolutionObject<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution, TInputDependency = InputDependency> = {
	getStaticSolution: GetStaticSolution<TParameters, TSolution>
	dependentFields?: string[]
	getInputDependency?: GetInputDependency<TSolution, TInputDependency>
	getDynamicSolution?: GetDynamicSolution<TParameters, TSolution, TInputDependency>
}

// Solution: joining the solution function and the solution object.
export type GetSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution, TInputDependency = InputDependency> = GetSolutionFunction<TParameters, TSolution> | GetSolutionObject<TParameters, TSolution, TInputDependency>

/*
 * Full exercise definition
 */

// Input exercise spec: what authors define before a concrete exercise builder adds the mode-specific reducers.
export type InputExerciseSpec<TMetaData extends InputExerciseMetaData, TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = {
	metaData: TMetaData
	generateParameters?: (example: boolean) => TParameters
	getSolution?: GetSolution<TParameters, TSolution>
}

// Internal reducer inputs use the deserialized runtime parameters, while actions and state remain plain data.
type InputExerciseReducerGeneralInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends InputExerciseParameters> = {
	state: TState
	parameters: TParameters
	updateSkills?: UpdateSkills
}
export type InputExerciseReducerSubmissionsInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends InputExerciseParameters> = InputExerciseReducerGeneralInput<TAction, TState, TParameters> & {
	mode: ExerciseMode
	history: ExerciseHistory<TAction, TState>
	submissions: readonly GroupExerciseSubmission<TAction>[]
}

// Input exercise: its public generator and reducer use stored data; author-facing callbacks use deserialized parameters.
export type InputExercise<TMetaData extends InputExerciseMetaData, TAction extends InputExerciseAction, TState extends ExerciseState, TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = Exercise<TMetaData, TAction, TState> & Omit<InputExerciseSpec<TMetaData, TParameters, TSolution>, 'generateParameters'> & {
	generateParameters: (example: boolean) => PlainDataObject
	processSoloAction: SoloExerciseReducer<TAction, TState>
	processGroupActions: GroupExerciseReducer<TAction, TState>
}

/*
 * Input for the CheckInput function to be implemented by child components
 */

export type CheckInputData<TMetaData extends InputExerciseMetaData = InputExerciseMetaData, TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = {
	metaData: TMetaData
	parameters: TParameters
	rawInput: InputExerciseInputValue
	input: InputExerciseInput
	solution?: TSolution
}
