import { type Matching, getOneToOneMatching, reverseMatching } from '@step-wise/js-utils'

import type { Load } from './types'
import type { LoadComparisonOptionsInput } from './comparisonOptions'
import { equalLoads } from './comparison'

export type LoadSetComparisonReport = {
	equal: boolean
	inputMatching: Matching
	solutionMatching: Matching
}

export function compareLoadSets(input: readonly Load[], solution: readonly Load[], options: LoadComparisonOptionsInput = {}): LoadSetComparisonReport {
	const inputMatching = getOneToOneMatching(input, solution, (inputLoad, solutionLoad) => equalLoads(inputLoad, solutionLoad, options))
	return {
		equal: input.length === solution.length && inputMatching.every(index => index !== undefined),
		inputMatching,
		solutionMatching: reverseMatching(inputMatching, solution.length),
	}
}

export function equalLoadSets(input: readonly Load[], solution: readonly Load[], options: LoadComparisonOptionsInput = {}): boolean {
	return compareLoadSets(input, solution, options).equal
}
