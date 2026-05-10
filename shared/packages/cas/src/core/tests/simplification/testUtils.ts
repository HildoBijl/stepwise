import { type ExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNodeInput, asExpressionNode } from '../../construction'
import { type SimplificationOptions, type ComparisonSettings, equalNodes, simplify } from '../../operations'
import { nodeToString, nodeToStorageValue } from '../../export'

export function expectSimplifyToGive(input: ExpressionNodeInput, output: ExpressionNodeInput, options: Partial<SimplificationOptions>, expressionSettings: Partial<ExpressionSettings> = {}, comparisonSettings: Partial<ComparisonSettings> = {}) {
	const inputValue = asExpressionNode(input), outputValue = asExpressionNode(output)
	const result = simplify(inputValue, options, expressionSettings)
	if (!equalNodes(result, outputValue, comparisonSettings)) throw new Error(`A simplification check did not give the expected result.
	Actual output:   ${nodeToString(result)}
	Expected output: ${nodeToString(outputValue)}
	Original input:  ${nodeToString(inputValue)}
	Actual output structure:   ${JSON.stringify(nodeToStorageValue(result))}
	Expected output structure: ${JSON.stringify(nodeToStorageValue(outputValue))}
	Original input structure:  ${JSON.stringify(nodeToStorageValue(inputValue))}`)
}
