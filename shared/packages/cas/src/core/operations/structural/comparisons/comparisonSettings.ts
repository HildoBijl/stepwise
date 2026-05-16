export type ExpressionComparisonSettings = {
	allowOrderChanges: boolean
}

// The default comparison settings are relatively loose and accepting.
export const defaultExpressionComparisonSettings: ExpressionComparisonSettings = {
	allowOrderChanges: true,
}

// A variant is used to compare in a more strict sense.
export const strictExpressionComparisonSettings: ExpressionComparisonSettings = {
	allowOrderChanges: false,
}
