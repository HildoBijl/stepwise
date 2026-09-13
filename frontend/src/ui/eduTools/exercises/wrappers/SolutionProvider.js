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
	if (getSolution !== undefined && typeof getSolution !== 'function' && !isPlainObject(getSolution))
		throw new Error(`Invalid getSolution parameter: received a parameter of type ${typeof getSolution}.`)

	const dependentFields = isPlainObject(getSolution) && getSolution.getDynamicSolution ? getSolution.dependentFields : []
	const input = useStableValue(useInputObject(dependentFields), shallowEqualObjects)
	const [resolved, setResolved] = useState({ solution: undefined, error: undefined })

	useEffect(() => {
		let active = true
		if (getSolution === undefined) {
			setResolved({ solution: undefined, error: undefined })
			return () => { active = false }
		}

		resolveSolution(getSolution, parameters, input)
			.then(solution => { if (active) setResolved({ solution, error: undefined }) })
			.catch(error => { if (active) setResolved({ solution: undefined, error }) })
		return () => { active = false }
	}, [getSolution, parameters, input])

	if (resolved.error) throw resolved.error
	if (getSolution !== undefined && resolved.solution === undefined) return null
	return <SolutionContext.Provider value={resolved.solution}>{children}</SolutionContext.Provider>
}

// useSolution is the hook used by exercises to extract the solution from the provider.
export function useSolution(throwOnMissing = true) {
	const solution = useContext(SolutionContext)
	if (solution === undefined && throwOnMissing)
		throw new Error(`Missing getSolution function: could not find the getSolution or getStaticSolution function in the shared export of the respective exercise.`)
	return solution
}
