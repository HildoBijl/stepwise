import { type OneToOneMatching, getOneToOneMatching, invertOneToOneMatching } from '@step-wise/js-utils'

import type { Load } from './types.ts'
import type { LoadComparisonOptionsInput } from './comparisonOptions.ts'
import { loadsEqual } from './comparison.ts'

export type LoadListComparisonReport = {
	equal: boolean
	inputMatching: OneToOneMatching
	solutionMatching: OneToOneMatching
}

export function compareLoadLists(input: readonly Load[], solution: readonly Load[], options: LoadComparisonOptionsInput = {}): LoadListComparisonReport {
	const inputMatching = getOneToOneMatching(input, solution, (inputLoad, solutionLoad) => loadsEqual(inputLoad, solutionLoad, options))
	return {
		equal: input.length === solution.length && inputMatching.every(index => index !== undefined),
		inputMatching,
		solutionMatching: invertOneToOneMatching(inputMatching, solution.length),
	}
}

export function loadListsEqual(input: readonly Load[], solution: readonly Load[], options: LoadComparisonOptionsInput = {}): boolean {
	return compareLoadLists(input, solution, options).equal
}
