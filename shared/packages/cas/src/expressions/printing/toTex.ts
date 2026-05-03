import { decimalSeparatorTex } from '../../settings'

import { ExpressionNode, Constant, Variable } from '../nodes'

export function toTex(node: ExpressionNode) {
	if (node instanceof Constant) return constantToTex(node)
	if (node instanceof Variable) return variableToTex(node)

	throw new Error(`Invalid toTex call: the subtype "${node.subtype}" has no implemented toTex method.`)
}

function constantToTex(node: Constant): string {
	return `${node.value}`.replace('.', decimalSeparatorTex)
}

function variableToTex(node: Variable): string {
	// Turn common symbols into Tex commands.
	let result
	if (node.symbol === 'π') result = '\\pi'
	else if (node.symbol === '∞') result = '\\infty'
	else result = node.symbol

	// Add accents and subscripts.
	if (node.accent) result = `\\${node.accent}{${result}}`
	if (node.subscript) result = `${result}_{${node.subscript}}`
	return result
}
