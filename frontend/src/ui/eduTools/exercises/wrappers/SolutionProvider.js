import React, { createContext, useContext, useEffect, useState } from 'react'

import { getInputDependency, resolveSolution, resolveStaticSolution } from '@step-wise/input-exercises'

import { useUserId } from 'api'

import { useExerciseData } from '../containers'
import { useInputHistoryAdoption } from '../util'

const SolutionContext = createContext(null)

// SolutionProvider resolves the solution for the input dependency stored in the current exercise state.
export function SolutionProvider({ children }) {
	const { mode, parameters, shared, state, valueOperations } = useExerciseData()
	const userId = useUserId()
	const { adoptUserHistory } = useInputHistoryAdoption()

	// On no getSolution function, publish undefined as the solution.
	if (shared.getSolution === undefined) return <SolutionContext.Provider value={undefined}>{children}</SolutionContext.Provider>

	// Calculate the solution, starting with the static one and then incorporating the input dependency.
	const dependencyUserId = mode === 'group' ? adoptUserHistory ?? userId : userId
	const inputDependency = getInputDependency(state, mode, valueOperations, dependencyUserId)
	return <StaticSolutionProvider {...{ children, shared, parameters, inputDependency }} />
}

// Calculate the static solution and update it when the exercise or parameters change.
function StaticSolutionProvider({ children, shared, parameters, inputDependency }) {
	const [resolved, setResolved] = useState({ shared: undefined, parameters: undefined, staticSolution: undefined, error: undefined })

	useEffect(() => {
		let active = true
		resolveStaticSolution(shared, parameters)
			.then(staticSolution => { if (active) setResolved({ shared, parameters, staticSolution, error: undefined }) })
			.catch(error => { if (active) setResolved({ shared, parameters, staticSolution: undefined, error }) })
		return () => { active = false }
	}, [shared, parameters])

	if (resolved.shared !== shared || resolved.parameters !== parameters) return null
	if (resolved.error) throw resolved.error
	return <ResolvedSolutionProvider {...{ children, shared, parameters, inputDependency, staticSolution: resolved.staticSolution }} />
}

// Extend the static solution by applying the input dependency.
function ResolvedSolutionProvider({ children, shared, parameters, inputDependency, staticSolution }) {
	const [resolved, setResolved] = useState({ staticSolution: undefined, inputDependency: undefined, solution: undefined, error: undefined })

	useEffect(() => {
		let active = true
		resolveSolution(shared, parameters, inputDependency, staticSolution)
			.then(solution => { if (active) setResolved({ staticSolution, inputDependency, solution, error: undefined }) })
			.catch(error => { if (active) setResolved({ staticSolution, inputDependency, solution: undefined, error }) })
		return () => { active = false }
	}, [shared, parameters, inputDependency, staticSolution])

	if (resolved.staticSolution !== staticSolution || resolved.inputDependency !== inputDependency) return null
	if (resolved.error) throw resolved.error
	if (resolved.solution === undefined) return null
	return <SolutionContext.Provider value={resolved.solution}>{children}</SolutionContext.Provider>
}

// useSolution is the hook used by exercises to extract the solution from the provider.
export function useSolution(throwOnMissing = true) {
	const solution = useContext(SolutionContext)
	if (solution === undefined && throwOnMissing) throw new Error(`Missing getSolution function: could not find the getSolution or getStaticSolution function in the shared export of the respective exercise.`)
	return solution
}
