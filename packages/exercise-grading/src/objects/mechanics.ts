import { type LoadComparisonOptionsInput, isLoad, loadListsEqual, resolveLoadComparisonOptions, freeBodyDiagramComparisonOptions } from '@step-wise/engineering-mechanics'
import { FreeBodyDiagramType } from '@step-wise/input-interpretation'

import type { TypeCompareFunction } from '../types'

export function compareFBD(inputValue: unknown, expectedValue: unknown, options: LoadComparisonOptionsInput): boolean {
	if (!Array.isArray(expectedValue)) throw new Error(`Invalid Free Body Diagram comparison: did not receive an array of loads as solution.`)
	if (!Array.isArray(inputValue)) throw new Error(`Invalid Free Body Diagram comparison: did not receive an array of loads as input.`)
	if (expectedValue.some(load => !isLoad(load))) throw new Error(`Invalid Free Body Diagram comparison: received solution parameters that were not loads.`)
	if (inputValue.some(load => !isLoad(load))) throw new Error(`Invalid Free Body Diagram comparison: received input parameters that were not loads.`)
	const resolvedOptions = resolveLoadComparisonOptions(options, freeBodyDiagramComparisonOptions)
	return loadListsEqual(inputValue, expectedValue, resolvedOptions)
}

export const mechanicsCompareFunctions = {
	[FreeBodyDiagramType]: compareFBD,
} satisfies Record<string, TypeCompareFunction>
