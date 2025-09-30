import React, { createContext, useContext, useMemo } from 'react'

import { isBasicObject } from 'step-wise/util'

import { useConsistentValue } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.
import { useInputObject } from 'ui/form'

import { useExerciseData } from '../containers'

const SolutionContext = createContext(null)

// SolutionProvider combines the data from the ExerciseContainer and potentially the Input from the Form to set up a solution. (The latter is only used in case of input-dependent solutions.) It then makes it available to the exercise components.
export function SolutionProvider({ children }) {
	const { shared } = useExerciseData()
	const { getSolution } = shared

	// How to set up the context depends on the type of getSolution.
	if (typeof getSolution === 'function')
		return <SolutionProviderForFunction>{children}</SolutionProviderForFunction>
	if (isBasicObject(getSolution))
		return <SolutionProviderForObject>{children}</SolutionProviderForObject>
	if (getSolution === undefined)
		return <SolutionContext.Provider value={undefined}>{children}</SolutionContext.Provider>

	// Invalid case. Throw an error.
	throw new Error(`Invalid getSolution parameter: received a parameter of type ${typeof getSolution}.`)
}

// SolutionProviderForFunction provides data in case getSolution is a function.
function SolutionProviderForFunction({ children }) {
	// Extract the solution from the getSolution function.
	const { state, shared } = useExerciseData()
	const { getSolution } = shared
	const solution = useMemo(() => getSolution ? getSolution(state) : undefined, [getSolution, state])

	// Return the solution in the context.
	return <SolutionContext.Provider value={solution}>{children}</SolutionContext.Provider>
}

// SolutionProviderForObject provides data in case getSolution is an object with getStaticSolution, getDynamicSolution, etcetera.
function SolutionProviderForObject({ children }) {
	const { state, shared } = useExerciseData()
	const { getSolution } = shared
	const { getStaticSolution, getInputDependency, dependentFields, getDynamicSolution } = getSolution

	// Determine the static solution.
	const staticSolution = useMemo(() => getStaticSolution ? getStaticSolution(state) : undefined, [getStaticSolution, state])

	// Get only the input parameters that are needed for the dependency.
	const input = useInputObject(getDynamicSolution ? dependentFields : undefined)

	// Determine the input dependency.
	const inputDependencyRecalculated = useMemo(() => {
		if (!getDynamicSolution)
			return undefined // No need to get an input dependency.
		if (!getInputDependency)
			return input // Default value on mission input dependency function.
		return getInputDependency(input, staticSolution)
	}, [input, getDynamicSolution, getInputDependency, staticSolution])
	const inputDependency = useConsistentValue(inputDependencyRecalculated)

	// Determine the dynamic solution.
	const dynamicSolution = useMemo(() => {
		if (!getDynamicSolution || inputDependency === undefined)
			return undefined // No dynamic solution present.
		return getDynamicSolution(inputDependency, staticSolution, state)
	}, [getDynamicSolution, inputDependency, staticSolution, state])

	// Assemble the full solution.
	const solution = useMemo(() => {
		if (dynamicSolution === undefined)
			return staticSolution
		return ({ ...(staticSolution || {}), ...(dynamicSolution || {}) })
	}, [staticSolution, dynamicSolution])

	// Wrap a provider around the contents.
	return <SolutionContext.Provider value={solution}>{children}</SolutionContext.Provider>
}

// useSolution is the hook used by exercises to extract the solution from the provider.
export function useSolution(throwOnMissing = true) {
	const solution = useContext(SolutionContext)
	if (solution === undefined && throwOnMissing)
		throw new Error(`Missing getSolution function: could not find the getSolution or getStaticSolution function in the shared export of the respective exercise.`)
	return solution
}
