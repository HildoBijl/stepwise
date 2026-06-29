import { ExerciseMetaData, ExerciseProgress, Exercise, ExerciseSpec, ExerciseState } from '@step-wise/exercise-definition'

/*
 * Fundamentals
 */

// Meta data: extend with comparison options.
export type InputExerciseMetaData = ExerciseMetaData & { comparison?: unknown }

// Actions: only allow input and giveUp actions.
export type InputExerciseInput = Record<string, unknown>
export type InputExerciseAction = { type: 'input', input: InputExerciseInput } | { type: 'giveUp' }
export type InputExerciseActionType = InputExerciseAction['type']

/*
 * Solution definition
 */

// Solution function: to generate a solution object from the state.
export type Solution = Record<string, unknown>
export type GetSolutionFunction<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = (state: TState) => TSolution

// Solution object: in case the solution depends on the user input, set up a dynamic solution based on input dependencies.
export type GetStaticSolution<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = (state: TState) => Partial<TSolution>
export type InputDependency = unknown
export type GetInputDependency<TSolution extends Solution = Solution, TInputDependency = InputDependency> = (input: InputExerciseInput, staticSolution: Partial<TSolution>) => TInputDependency
export type GetDynamicSolution<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution, TInputDependency = InputDependency> = (inputDependency: TInputDependency, staticSolution: Partial<TSolution>, state: TState) => Partial<TSolution>
export type GetSolutionObject<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution, TInputDependency = InputDependency> = {
	getStaticSolution: GetStaticSolution<TState, TSolution>
	dependentFields?: string[]
	getInputDependency?: GetInputDependency<TSolution, TInputDependency>
	getDynamicSolution?: GetDynamicSolution<TState, TSolution, TInputDependency>
}

// Solution: joining the solution function and the solution object.
export type GetSolution<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution, TInputDependency = InputDependency> = GetSolutionFunction<TState, TSolution> | GetSolutionObject<TState, TSolution, TInputDependency>

/*
 * Full exercise definition
 */

// Input exercise spec: what authors define before a concrete exercise builder adds processAction.
export type InputExerciseSpec<TMetaData extends InputExerciseMetaData, TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = ExerciseSpec<TMetaData, TState> & {
	getSolution?: GetSolution<TState, TSolution>
}

// Input exercise: runtime object after a concrete builder adds processAction.
export type InputExercise<TMetaData extends InputExerciseMetaData, TAction extends InputExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = Exercise<TMetaData, TAction, TProgress, TState> & InputExerciseSpec<TMetaData, TState, TSolution>

/*
 * Input for the CheckInput function to be implemented by child components
 */

export type CheckInputData<TMetaData extends InputExerciseMetaData = InputExerciseMetaData, TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = {
	metaData: TMetaData
	state: TState
	input: InputExerciseInput
	solution?: TSolution
}
