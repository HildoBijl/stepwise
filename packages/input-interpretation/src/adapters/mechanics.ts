import { type Load, type SerializedLoad, isLoad, isSerializedLoad, serializeLoad, deserializeLoad } from '@step-wise/engineering-mechanics'

import type { InputValue, InputValueAdapter } from '../types.ts'
import { isInputValueOfType } from '../support.ts'

export const FreeBodyDiagramType = 'FreeBodyDiagram'
export type FreeBodyDiagramType = typeof FreeBodyDiagramType

export type FreeBodyDiagramInputValue = InputValue<FreeBodyDiagramType, SerializedLoad[]>

function isSerializedLoadList(value: unknown): value is SerializedLoad[] {
	return Array.isArray(value) && value.every(isSerializedLoad)
}

export const freeBodyDiagramInputValueAdapter = {
	isInputValue: (value: unknown): value is FreeBodyDiagramInputValue => isInputValueOfType(value, FreeBodyDiagramType, isSerializedLoadList),
	isDomainValue: (value: unknown): value is Load[] => Array.isArray(value) && value.every(isLoad),
	interpret: (inputValue: FreeBodyDiagramInputValue) => inputValue.value.map(serializedLoad => deserializeLoad(serializedLoad)),
	toInputValue: freeBodyDiagram => ({ type: FreeBodyDiagramType, value: freeBodyDiagram.map(load => serializeLoad(load)) }),
} satisfies InputValueAdapter<FreeBodyDiagramInputValue, Load[]>

export const mechanicsInputValueAdapters = {
	[FreeBodyDiagramType]: freeBodyDiagramInputValueAdapter,
}
