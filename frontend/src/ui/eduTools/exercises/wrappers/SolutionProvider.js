import React, { createContext, useContext, useMemo } from 'react'

import { useConsistentValue } from 'util/react'
import { useInputObject } from 'ui/form'

import { useExerciseData } from '../containers'

const SolutionContext = createContext(null)

// SolutionProvider combines the data from the ExerciseContainer and potentially the Input from the Form to set up a solution. (The latter is only used in case of input-dependent solutions.) It then makes it available to the exercise components.
export function SolutionProvider({ children }) {
	// Extract data: the exercise data and the form input. Only get the required data and nothing more.
	const { state, shared } = useExerciseData()
	const { getSolution, getStaticSolution, getInputDependency, dependentFields, getDynamicSolution } = shared
	const input = useInputObject(getDynamicSolution ? dependentFields : undefined)

	// Determine the static solution.
	const currGetSolution = getSolution || getStaticSolution
	const staticSolution = useMemo(() => currGetSolution ? currGetSolution(state) : undefined, [currGetSolution, state])

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
