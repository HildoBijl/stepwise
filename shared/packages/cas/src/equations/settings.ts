import { type ExpressionComparisonSettings, defaultExpressionComparisonSettings, strictExpressionComparisonSettings } from '../expressions'

// Comparison
export type EquationComparisonSettings = ExpressionComparisonSettings & {
	allowSideSwitch: boolean
}
export const defaultEquationComparisonSettings = {
	...defaultExpressionComparisonSettings,
	allowSideSwitch: true,
}
export const strictEquationComparisonSettings = {
	...strictExpressionComparisonSettings,
	allowSideSwitch: false,
}
