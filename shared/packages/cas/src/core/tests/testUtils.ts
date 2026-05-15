import { type ExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNodeInput, asExpressionNode, nodeToTree } from '../construction'
import { type SimplificationOptionsInput, type ComparisonSettings, strictEqualNodes, simplify } from '../operations'
import { nodeToString } from '../export'

export function expectNodeToEqual(result: ExpressionNodeInput, expected: ExpressionNodeInput, comparisonSettings: Partial<ComparisonSettings> = {}) {
	const resultValue = asExpressionNode(result)
	const expectedValue = asExpressionNode(expected)
	if (!strictEqualNodes(resultValue, expectedValue, comparisonSettings)) throw new Error(`A node was not what was expected.
	Actual output:   ${nodeToString(resultValue)}
	Expected output: ${nodeToString(expectedValue)}
	Actual output structure:   ${nodeToTree(resultValue)}
	Expected output structure: ${nodeToTree(expectedValue)}`)
}

export function expectSimplifyToGive(input: ExpressionNodeInput, output: ExpressionNodeInput, options: SimplificationOptionsInput, expressionSettings: Partial<ExpressionSettings> = {}, comparisonSettings: Partial<ComparisonSettings> = {}) {
	const inputValue = asExpressionNode(input)
	const outputValue = asExpressionNode(output)
	const result = simplify(inputValue, expressionSettings, options)
	if (!strictEqualNodes(result, outputValue, comparisonSettings)) throw new Error(`A simplification check did not give the expected result.
	Actual output:   ${nodeToString(result)}
	Expected output: ${nodeToString(outputValue)}
	Original input:  ${nodeToString(inputValue)}
	Actual output structure:   ${nodeToTree(result)}
	Expected output structure: ${nodeToTree(outputValue)}
	Original input structure:  ${nodeToTree(inputValue)}`)
}
