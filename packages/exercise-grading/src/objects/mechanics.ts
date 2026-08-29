import { type Load, type LoadComparisonOptionsInput, isLoad, isLoadComparisonOptionsInput, loadListsEqual, resolveLoadComparisonOptions, freeBodyDiagramComparisonOptions } from '@step-wise/engineering-mechanics'
import { FreeBodyDiagramType } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'

type FreeBodyDiagram = Load[]

export function areFreeBodyDiagramsEqual(inputValue: FreeBodyDiagram, expectedValue: FreeBodyDiagram, options: LoadComparisonOptionsInput = {}): boolean {
	const resolvedOptions = resolveLoadComparisonOptions(options, freeBodyDiagramComparisonOptions)
	return loadListsEqual(inputValue, expectedValue, resolvedOptions)
}

function isFreeBodyDiagram(value: unknown): value is FreeBodyDiagram {
	return Array.isArray(value) && value.every(isLoad)
}

export const mechanicsEqualityAdapters = {
	[FreeBodyDiagramType]: {
		isValue: isFreeBodyDiagram,
		isOptions: isLoadComparisonOptionsInput,
		areEqual: areFreeBodyDiagramsEqual,
	} satisfies ValueEqualityAdapter<FreeBodyDiagram, LoadComparisonOptionsInput>,
}
