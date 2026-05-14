import { ExpressionNode } from './ExpressionNode'
import { ConstantNode, NamedConstant } from './constants'
import { Sign } from './signs'
import { Variable } from './Variable'
import { ListNode } from './lists'
import { FunctionNode } from './functions'

export function nodeToTree(node: ExpressionNode) {
	if (node instanceof ConstantNode) return constantToTree(node)
	if (node instanceof Sign) return signToTree(node)
	if (node instanceof Variable) return variableToTree(node)
	if (node instanceof ListNode) return sumToTree(node)
	if (node instanceof FunctionNode) return functionToTree(node)
	throw new Error(`Invalid toTree call: the sub"${node.subtype}" has no implemented toTree method. Could not stringify the object "${node}".`)
}

function constantToTree(node: ConstantNode): string {
	return `${node.name}(${node instanceof NamedConstant ? `'${node.symbol}'` : node.value})`
}

function signToTree(node: Sign): string {
	return `${node.name}(${nodeToTree(node.node)})`
}

function variableToTree(node: Variable) {
	let args = `'${node.symbol}'`
	if (node.subscript || node.accent) args += `, '${node.subscript ?? ''}'`
	if (node.accent) args += `, '${node.accent ?? ''}'`
	return `${node.name}(${args})`
}

function sumToTree(node: ListNode): string {
	return `${node.name}(${node.nodes.map(nodeToTree).join(', ')})`
}

function functionToTree(node: FunctionNode): string {
	return `${node.name}(${node.args.map(nodeToTree).join(', ')})`
}
