import { type ExpressionLike, asExpression } from '../../expressions'
import { type EquationLike, asEquation } from '../../equations'

export function expectExpressionToEqual(result: ExpressionLike, expected: ExpressionLike) {
	const resultValue = asExpression(result)
	const expectedValue = asExpression(expected, undefined, resultValue.settings)
	if (!expectedValue.strictEqualStructure(resultValue)) throw new Error(`An expression was not what was expected.
	Actual output:   ${resultValue.str}
	Expected output: ${expectedValue.str}
	Actual output structure:   ${resultValue.tree}
	Expected output structure: ${expectedValue.tree}`)
}

export function expectEquationToEqual(result: EquationLike, expected: EquationLike) {
	const resultValue = asEquation(result)
	const expectedValue = asEquation(expected, undefined, resultValue.settings)
	if (!expectedValue.strictEqualStructure(resultValue)) throw new Error(`An equation was not what was expected.
	Actual output:   ${resultValue.str}
	Expected output: ${expectedValue.str}
	Actual output structure:   ${resultValue.tree}
	Expected output structure: ${expectedValue.tree}`)
}
