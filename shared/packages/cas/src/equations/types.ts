import type { ExpressionStorageValue, ExpressionSettings } from '../expressions'

export type EquationStorageValue = {
	left: ExpressionStorageValue
	right: ExpressionStorageValue
}

export type SerializedEquation = {
	type: 'Equation'
	value: EquationStorageValue
	settings?: Partial<ExpressionSettings>
}
