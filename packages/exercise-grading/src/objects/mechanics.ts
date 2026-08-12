import { type LoadComparisonOptionsInput, isLoad, equalLoadSets, resolveLoadComparisonOptions, FBDComparison } from '@step-wise/engineering-mechanics'
import { FBDType } from '@step-wise/input-interpretation'

import type { TypeCompareFunction } from '../types'

export function compareFBD(input: unknown, correct: unknown, options: LoadComparisonOptionsInput): boolean {
	if (!Array.isArray(correct)) throw new Error(`Invalid Free Body Diagram comparison: did not receive an array of loads as solution.`)
	if (!Array.isArray(input)) throw new Error(`Invalid Free Body Diagram comparison: did not receive an array of loads as input.`)
	if (correct.some(load => !isLoad(load))) throw new Error(`Invalid Free Body Diagram comparison: received solution parameters that were not loads.`)
	if (input.some(load => !isLoad(load))) throw new Error(`Invalid Free Body Diagram comparison: received input parameters that were not loads.`)
	const resolvedOptions = resolveLoadComparisonOptions(options, FBDComparison)
	return equalLoadSets(input, correct, resolvedOptions)
}

export const mechanicsCompareFunctions = {
	[FBDType]: compareFBD,
} satisfies Record<string, TypeCompareFunction>
