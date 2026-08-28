import { ExpressionNode } from './ExpressionNode.ts'
import { ConstantNode, NamedConstant } from './constants/index.ts'
import { SignNode } from './signs/index.ts'
import { Variable } from './Variable.ts'
import { ListNode } from './lists/index.ts'
import { FunctionNode } from './functions/index.ts'

export function nodeToTree(node: ExpressionNode) {
	if (node instanceof ConstantNode) return constantToTree(node)
	if (node instanceof SignNode) return signToTree(node)
	if (node instanceof Variable) return variableToTree(node)
	if (node instanceof ListNode) return sumToTree(node)
	if (node instanceof FunctionNode) return functionToTree(node)
	throw new Error(`Invalid toTree call: the sub"${node.subtype}" has no implemented toTree method. Could not stringify the object "${node}".`)
}

function constantToTree(node: ConstantNode): string {
	return `${node.name}(${node instanceof NamedConstant ? `'${node.symbol}'` : node.value})`
}

function signToTree(node: SignNode): string {
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
