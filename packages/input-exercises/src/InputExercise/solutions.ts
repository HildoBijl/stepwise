import type { InputDependency, InputExerciseMetadata, InputExerciseParameters, InputExerciseSolution, InputExerciseSpec, UpdateInputDependencyData } from './types.ts'

type SolutionCallbacks<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency> = Pick<InputExerciseSpec<InputExerciseMetadata, TParameters, TSolution, TInputDependency>, 'getInitialInputDependency' | 'updateInputDependency' | 'getStaticSolution' | 'getSolution'>

// Resolve the dependency used before any learner input has been submitted.
export async function resolveInitialInputDependency<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(definition: SolutionCallbacks<TParameters, TSolution, TInputDependency>, parameters: TParameters): Promise<TInputDependency | undefined> {
	return definition.getInitialInputDependency === undefined ? undefined : await definition.getInitialInputDependency(parameters)
}

// Update the dependency with the input submitted for the current exercise step.
export async function resolveUpdatedInputDependency<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(definition: SolutionCallbacks<TParameters, TSolution, TInputDependency>, data: UpdateInputDependencyData<TParameters, TInputDependency>): Promise<TInputDependency | undefined> {
	return definition.updateInputDependency === undefined ? data.previousInputDependency : await definition.updateInputDependency(data)
}

// Resolve the reusable input-independent portion of a solution.
export async function resolveStaticSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(definition: SolutionCallbacks<TParameters, TSolution, TInputDependency>, parameters: TParameters): Promise<Partial<TSolution>> {
	return definition.getStaticSolution === undefined ? {} : await definition.getStaticSolution(parameters)
}

// Resolve the complete solution from the parameters, current dependency and static portion.
export async function resolveSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(definition: SolutionCallbacks<TParameters, TSolution, TInputDependency>, parameters: TParameters, inputDependency: TInputDependency | undefined, staticSolution: Partial<TSolution>): Promise<TSolution | undefined> {
	return definition.getSolution === undefined ? undefined : await definition.getSolution(parameters, inputDependency, staticSolution)
}
