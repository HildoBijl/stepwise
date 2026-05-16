import type { ExpressionStorageValue, ExpressionSettings } from '../expressions'

// Serialization
export type EquationStorageValue = {
	left: ExpressionStorageValue
	right: ExpressionStorageValue
}
export type SerializedEquation = {
	type: 'Equation'
	value: EquationStorageValue
	settings?: Partial<ExpressionSettings>
}
