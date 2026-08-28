import { pickKeys, isPlainObject } from '@step-wise/js-utils'

import type { InputExerciseInput, InputExerciseParameters, InputExerciseSolution, SolutionDefinition } from './types.ts'

// Assemble a solution object from a getSolution function or object.
export function resolveSolution<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(getSolution: SolutionDefinition<TParameters, TSolution>, parameters: TParameters, input: InputExerciseInput = {}): TSolution {
	// If getSolution is a function, just run it.
	if (typeof getSolution === 'function') return getSolution(parameters)

	// So getSolution should be an object.
	if (!isPlainObject(getSolution)) throw new Error(`Invalid getSolution parameter: expected either a getSolution function or a getSolution object. Got a parameter of type ${typeof getSolution}.`)
	const { getStaticSolution, getInputDependency, dependentFields, getDynamicSolution } = getSolution

	// Get the static solution.
	if (typeof getStaticSolution !== 'function') throw new Error(`Invalid resolveSolution call: could not find a getStaticSolution function in the solution definition.`)
	const staticSolution = getStaticSolution(parameters)

	// If there is no dynamic solution, we're done.
	if (!getDynamicSolution) return staticSolution as TSolution

	// Get the input dependency and use it to find the dynamic solution. Merge it with the static solution.
	const filteredInput = dependentFields ? pickKeys(input, dependentFields) : input
	const inputDependency = getInputDependency ? getInputDependency(filteredInput, staticSolution) : filteredInput
	const dynamicSolution = getDynamicSolution(inputDependency, staticSolution, parameters)

	return { ...staticSolution, ...dynamicSolution } as TSolution
}
