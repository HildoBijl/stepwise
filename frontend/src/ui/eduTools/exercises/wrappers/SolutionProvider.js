import React, { createContext, useContext, useEffect, useState } from 'react'

import { isPlainObject, shallowEqualObjects } from '@step-wise/js-utils'
import { resolveSolution } from '@step-wise/input-exercises'
import { useStableValue } from '@step-wise/react-utils'

import { useInputObject } from 'ui/form'

import { useExerciseData } from '../containers'

const SolutionContext = createContext(null)

// SolutionProvider resolves synchronous and asynchronous whole, static, and dynamic solutions and makes the latest result available to exercise components.
export function SolutionProvider({ children }) {
	const { parameters, shared } = useExerciseData()
	const { getSolution } = shared

	if (getSolution === undefined) return <SolutionContext.Provider value={undefined}>{children}</SolutionContext.Provider>
	if (typeof getSolution === 'function' || (isPlainObject(getSolution) && !getSolution.getDynamicSolution))
		return <ResolvedSolutionProvider getSolution={getSolution} parameters={parameters}>{children}</ResolvedSolutionProvider>
	if (isPlainObject(getSolution))
		return <DynamicSolutionProvider getSolution={getSolution} parameters={parameters}>{children}</DynamicSolutionProvider>
	throw new Error(`Invalid getSolution parameter: received a parameter of type ${typeof getSolution}.`)
}

function ResolvedSolutionProvider({ children, getSolution, parameters, input }) {
	const [resolved, setResolved] = useState({ solution: undefined, error: undefined })

	useEffect(() => {
		let active = true
		resolveSolution(getSolution, parameters, input)
			.then(solution => { if (active) setResolved({ solution, error: undefined }) })
			.catch(error => { if (active) setResolved({ solution: undefined, error }) })
		return () => { active = false }
	}, [getSolution, parameters, input])

	if (resolved.error) throw resolved.error
	if (resolved.solution === undefined) return null
	return <SolutionContext.Provider value={resolved.solution}>{children}</SolutionContext.Provider>
}

function DynamicSolutionProvider({ children, getSolution, parameters }) {
	const input = useStableValue(useInputObject(getSolution.dependentFields), shallowEqualObjects)
	return <ResolvedSolutionProvider getSolution={getSolution} parameters={parameters} input={input}>{children}</ResolvedSolutionProvider>
}

// useSolution is the hook used by exercises to extract the solution from the provider.
export function useSolution(throwOnMissing = true) {
	const solution = useContext(SolutionContext)
	if (solution === undefined && throwOnMissing)
		throw new Error(`Missing getSolution function: could not find the getSolution or getStaticSolution function in the shared export of the respective exercise.`)
	return solution
}
