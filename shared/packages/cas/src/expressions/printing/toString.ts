import { decimalSeparator } from '../../settings'

import { ExpressionNode, Constant, Variable } from '../nodes'

export function toString(node: ExpressionNode) {
	if (node instanceof Constant) return constantToString(node)
	if (node instanceof Variable) return variableToString(node)

	throw new Error(`Invalid toString call: the subtype "${node.subtype}" has no implemented toString method.`)
}

function constantToString(node: Constant): string {
	return `${node.value}`.replace('.', decimalSeparator)
}

function variableToString(node: Variable): string {
	let result = node.symbol
	if (node.accent) result = `${node.accent}(${result})`
	if (node.subscript)	result = node.subscript.length > 1 ? `${result}_(${node.subscript})` : `${result}_${node.subscript}`
	return result
}
