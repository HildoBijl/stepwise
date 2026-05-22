import { type ExpressionSettingsInput } from '@step-wise/math-input-value'

import { type ExpressionNodeInput, asExpressionNode, nodeToTree } from '../construction'
import { type SimplificationOptionsInput, equalNodes, simplify } from '../operations'
import { nodeToString } from '../export'

export function expectNodeToEqual(result: ExpressionNodeInput, expected: ExpressionNodeInput) {
	const resultValue = asExpressionNode(result)
	const expectedValue = asExpressionNode(expected)
	if (!equalNodes(resultValue, expectedValue, false)) throw new Error(`A node was not what was expected.
	Actual output:   ${nodeToString(resultValue)}
	Expected output: ${nodeToString(expectedValue)}
	Actual output structure:   ${nodeToTree(resultValue)}
	Expected output structure: ${nodeToTree(expectedValue)}`)
}

export function expectSimplifyToGive(input: ExpressionNodeInput, output: ExpressionNodeInput, options: SimplificationOptionsInput, expressionSettings: ExpressionSettingsInput = {}) {
	const inputValue = asExpressionNode(input)
	const outputValue = asExpressionNode(output)
	const result = simplify(inputValue, expressionSettings, options)
	if (!equalNodes(result, outputValue, false)) throw new Error(`A simplification check did not give the expected result.
	Actual output:   ${nodeToString(result)}
	Expected output: ${nodeToString(outputValue)}
	Original input:  ${nodeToString(inputValue)}
	Actual output structure:   ${nodeToTree(result)}
	Expected output structure: ${nodeToTree(outputValue)}
	Original input structure:  ${nodeToTree(inputValue)}`)
}
