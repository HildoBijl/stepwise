export type ExpressionSettings = {
	degrees: boolean
}

export const defaultExpressionSettings: ExpressionSettings = {
	degrees: false, // Affects for instance how trigonometric functions like sine can be reduced to numbers.
}
