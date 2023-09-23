import { numeric as expressionNumeric, validWithVariables } from '../ExpressionInput'

export function any() { }
export function numeric(equation) {
	return expressionNumeric(equation.left) || expressionNumeric(equation.right)
}
export { validWithVariables } // This is the same as for Expressions.
