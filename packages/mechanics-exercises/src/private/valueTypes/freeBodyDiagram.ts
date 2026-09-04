import { type Load, type LoadComparisonOptionsInput, type SerializedLoad, freeBodyDiagramComparisonOptions, isLoad, isLoadComparisonOptionsInput, isSerializedLoad, loadListsEqual, resolveLoadComparisonOptions, deserializeLoad, serializeLoad } from '@step-wise/engineering-mechanics'
import { type InputValue, type InputValueAdapter, isInputValueOfType } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'
import type { ValueType } from '@step-wise/value-types'

export const FreeBodyDiagramType = 'FreeBodyDiagram'
export type FreeBodyDiagramType = typeof FreeBodyDiagramType

export type FreeBodyDiagram = Load[]
export type FreeBodyDiagramInputValue = InputValue<FreeBodyDiagramType, SerializedLoad[]>

function isSerializedLoadList(value: unknown): value is SerializedLoad[] {
	return Array.isArray(value) && value.every(isSerializedLoad)
}

function isFreeBodyDiagram(value: unknown): value is FreeBodyDiagram {
	return Array.isArray(value) && value.every(isLoad)
}

export const freeBodyDiagramInputValueAdapter = {
	isInputValue: (value: unknown): value is FreeBodyDiagramInputValue => isInputValueOfType(value, FreeBodyDiagramType, isSerializedLoadList),
	isDomainValue: isFreeBodyDiagram,
	interpret: inputValue => inputValue.value.map(deserializeLoad),
	toInputValue: freeBodyDiagram => ({ type: FreeBodyDiagramType, value: freeBodyDiagram.map(serializeLoad) }),
} satisfies InputValueAdapter<FreeBodyDiagramInputValue, FreeBodyDiagram>

export const freeBodyDiagramEqualityAdapter = {
	isValue: isFreeBodyDiagram,
	isOptions: isLoadComparisonOptionsInput,
	areEqual: (inputValue, expectedValue, options = {}) => loadListsEqual(inputValue, expectedValue, resolveLoadComparisonOptions(options, freeBodyDiagramComparisonOptions)),
} satisfies ValueEqualityAdapter<FreeBodyDiagram, LoadComparisonOptionsInput>

export const freeBodyDiagramValueType = {
	inputValue: freeBodyDiagramInputValueAdapter,
	equality: freeBodyDiagramEqualityAdapter,
} satisfies ValueType
