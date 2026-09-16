import type { InputDependency, InputExerciseMetadata, InputExerciseParameters, InputExerciseSolution, InputExerciseSpec, UpdateInputDependencyData } from './types.ts'

type SolutionCallbacks<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency,
	TContext,
> = Pick<InputExerciseSpec<InputExerciseMetadata, TParameters, TSolution, TInputDependency, TContext>, 'getStaticSolution' | 'updateInputDependency' | 'getSolution'>

// Resolve the reusable input-independent portion of a solution.
export async function resolveStaticSolution<
	TParameters extends InputExerciseParameters = InputExerciseParameters,
	TSolution extends InputExerciseSolution = InputExerciseSolution,
	TInputDependency = InputDependency,
	TContext = undefined,
>(
	definition: SolutionCallbacks<TParameters, TSolution, TInputDependency, TContext>,
	parameters: TParameters,
	context: TContext,
): Promise<Partial<TSolution>> {
	return definition.getStaticSolution === undefined ? {} : await definition.getStaticSolution({ parameters, context })
}

// Update the dependency with the input submitted for the current exercise step.
export async function resolveUpdatedInputDependency<
	TParameters extends InputExerciseParameters = InputExerciseParameters,
	TSolution extends InputExerciseSolution = InputExerciseSolution,
	TInputDependency = InputDependency,
	TContext = undefined,
>(
	definition: SolutionCallbacks<TParameters, TSolution, TInputDependency, TContext>,
	data: UpdateInputDependencyData<TParameters, TSolution, TInputDependency, TContext>,
): Promise<TInputDependency | undefined> {
	return definition.updateInputDependency === undefined ? data.previousInputDependency : await definition.updateInputDependency(data)
}

// Resolve the complete solution by combining its static and dynamic portions.
export async function resolveSolution<
	TParameters extends InputExerciseParameters = InputExerciseParameters,
	TSolution extends InputExerciseSolution = InputExerciseSolution,
	TInputDependency = InputDependency,
	TContext = undefined,
>(
	definition: SolutionCallbacks<TParameters, TSolution, TInputDependency, TContext>,
	parameters: TParameters,
	inputDependency: TInputDependency | undefined,
	staticSolution: Partial<TSolution>,
	context: TContext,
): Promise<TSolution | undefined> {
	if (definition.getSolution === undefined) return undefined
	const dynamicSolution = await definition.getSolution({ parameters, inputDependency, staticSolution, context })
	return { ...staticSolution, ...dynamicSolution } as TSolution
}
