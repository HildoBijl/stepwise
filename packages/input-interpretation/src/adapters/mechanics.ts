import { type Load, type SerializedLoad, serializeLoad, deserializeLoad } from '@step-wise/engineering-mechanics'

import type { InputValueAdapter } from '../types.ts'

export const FreeBodyDiagramType = 'FreeBodyDiagram'
export type FreeBodyDiagramType = typeof FreeBodyDiagramType

export type FreeBodyDiagramInputValue = {
	type: FreeBodyDiagramType,
	value: SerializedLoad[]
}

export const freeBodyDiagramInputValueAdapter = {
	interpret: (inputValue: FreeBodyDiagramInputValue) => inputValue.value.map(serializedLoad => deserializeLoad(serializedLoad)),
	toInputValue: freeBodyDiagram => ({ type: FreeBodyDiagramType, value: freeBodyDiagram.map(load => serializeLoad(load)) }),
} satisfies InputValueAdapter<FreeBodyDiagramInputValue, Load[]>

export const mechanicsInputValueAdapters = {
	[FreeBodyDiagramType]: freeBodyDiagramInputValueAdapter,
}
