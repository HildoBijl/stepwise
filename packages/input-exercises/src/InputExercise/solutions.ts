import type { InputDependency, InputExerciseMetadata, InputExerciseParameters, InputExerciseSolution, InputExerciseSpec, UpdateInputDependencyData } from './types.ts'

type SolutionCallbacks<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency> = Pick<InputExerciseSpec<InputExerciseMetadata, TParameters, TSolution, TInputDependency>, 'getStaticSolution' | 'updateInputDependency' | 'getSolution'>

// Resolve the reusable input-independent portion of a solution.
export async function resolveStaticSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(definition: SolutionCallbacks<TParameters, TSolution, TInputDependency>, parameters: TParameters): Promise<Partial<TSolution>> {
	return definition.getStaticSolution === undefined ? {} : await definition.getStaticSolution(parameters)
}

// Update the dependency with the input submitted for the current exercise step.
export async function resolveUpdatedInputDependency<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(definition: SolutionCallbacks<TParameters, TSolution, TInputDependency>, data: UpdateInputDependencyData<TParameters, TInputDependency>): Promise<TInputDependency | undefined> {
	return definition.updateInputDependency === undefined ? data.previousInputDependency : await definition.updateInputDependency(data)
}

// Resolve the complete solution by combining its static and dynamic portions.
export async function resolveSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(definition: SolutionCallbacks<TParameters, TSolution, TInputDependency>, parameters: TParameters, inputDependency: TInputDependency | undefined, staticSolution: Partial<TSolution>): Promise<TSolution | undefined> {
	if (definition.getSolution === undefined) return undefined
	const dynamicSolution = await definition.getSolution(parameters, inputDependency, staticSolution)
	return { ...staticSolution, ...dynamicSolution } as TSolution
}
