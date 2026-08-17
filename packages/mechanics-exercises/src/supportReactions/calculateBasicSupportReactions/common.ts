import { fromEntries } from '@step-wise/js-utils'
import { reverseLoad } from '@step-wise/engineering-mechanics'

import { getLoadDirectionIndices } from './support'

export function getInputDependency(input: any, solution: any): boolean[] {
	return getLoadDirectionIndices(input.loads, solution.loads)
}

export function getDynamicSolution(inputDependency: unknown, solution: any) {
	const directionIndices = inputDependency as boolean[]
	const hasAdjustedSolution = directionIndices.includes(false)
	const loads = solution.loads.map((load: any, index: number) => directionIndices[index] ? load : reverseLoad(load))
	const loadValues = solution.loadValues.map((value: any, index: number) => directionIndices[index] ? value : value.negate())
	return { ...solution, directionIndices, hasAdjustedSolution, loads, loadValues, ...fromEntries(solution.loadNames, loadValues) }
}
