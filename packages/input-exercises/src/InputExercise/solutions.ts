import { pickKeys, isPlainObject } from '@step-wise/js-utils'

import type { InputExerciseInput, InputExerciseParameters, InputExerciseSolution, SolutionDefinition } from './types.ts'

// Assemble a solution object from a getSolution function or object.
export async function resolveSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(getSolution: SolutionDefinition<TParameters, TSolution>, parameters: TParameters, input: InputExerciseInput = {}): Promise<TSolution> {
	// If getSolution is a function, just run it.
	if (typeof getSolution === 'function') return await getSolution(parameters)

	// So getSolution should be an object.
	if (!isPlainObject(getSolution)) throw new Error(`Invalid getSolution parameter: expected either a getSolution function or a getSolution object. Got a parameter of type ${typeof getSolution}.`)
	const { getStaticSolution, getInputDependency, dependentFields, getDynamicSolution } = getSolution

	// Get the complete static solution when no dynamic generator is present.
	if (typeof getStaticSolution !== 'function') throw new Error(`Invalid resolveSolution call: could not find a getStaticSolution function in the solution definition.`)
	if (getDynamicSolution === undefined) return await getStaticSolution(parameters)

	// Get the input dependency and combine the static and dynamic parts of the solution.
	const staticSolution = await getStaticSolution(parameters)
	const filteredInput = dependentFields ? pickKeys(input, dependentFields) : input
	const inputDependency = getInputDependency ? await getInputDependency(filteredInput, staticSolution) : filteredInput
	const dynamicSolution = await getDynamicSolution(inputDependency, staticSolution, parameters)

	// The definition contract requires both partial results to jointly form TSolution.
	return { ...staticSolution, ...dynamicSolution } as TSolution
}
