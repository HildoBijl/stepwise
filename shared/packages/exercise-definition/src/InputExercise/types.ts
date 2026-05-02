import { ExerciseMetaData, ExerciseProgress, Exercise, ExerciseState } from '../Exercise'

// Meta data: extend with comparison options.
export type InputExerciseMetaData = ExerciseMetaData & { comparison?: unknown }

// Actions: only allow input and giveUp actions.
export type InputExerciseInput = Record<string, unknown>
export type InputExerciseAction = { type: 'input', input: InputExerciseInput } | { type: 'giveUp' }
export type InputExerciseActionType = InputExerciseAction['type']

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

// Input checking: verify whether the given input solves the exercise.
export type CheckInputData<TState extends ExerciseState = ExerciseState, TMetaData extends InputExerciseMetaData = InputExerciseMetaData, TSolution extends Solution = Solution> = {
	state: TState
	input: InputExerciseInput
	solution?: TSolution
	metaData: TMetaData
}
export type CheckInput<TState extends ExerciseState = ExerciseState, TMetaData extends InputExerciseMetaData = InputExerciseMetaData, TSolution extends Solution = Solution> = (data: CheckInputData<TState, TMetaData, TSolution>) => boolean

// Input exercise: extend the general exercise with a getSolution function and checkInput function.
export type InputExercise<TMetaData extends InputExerciseMetaData, TExerciseAction extends InputExerciseAction, TExerciseProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = Exercise<TMetaData, TExerciseAction, TExerciseProgress, TState> & {
	checkInput: CheckInput<TState, TMetaData, TSolution>
	getSolution?: GetSolution<TState, TSolution>
}
