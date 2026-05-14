import type { ExpressionNode, ConstantNode, Sign, Variable, ListNode, FunctionNode } from '../../construction'
import { isConstantNode, isNamedConstant, isSignNode, isVariable, isListNode, isFunctionNode } from '../../operations'

export function nodeToTree(node: ExpressionNode) {
	if (isConstantNode(node)) return constantToTree(node)
	if (isSignNode(node)) return signToTree(node)
	if (isVariable(node)) return variableToTree(node)
	if (isListNode(node)) return sumToTree(node)
	if (isFunctionNode(node)) return functionToTree(node)
	throw new Error(`Invalid toTree call: the sub"${node.subtype}" has no implemented toTree method. Could not stringify the object "${node}".`)
}

function constantToTree(node: ConstantNode): string {
	return `${node.name}(${isNamedConstant(node) ? `'${node.symbol}'` : node.value})`
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
	return `${node.name}(${node.terms.map(nodeToTree).join(', ')})`
}

function functionToTree(node: FunctionNode): string {
	return `${node.name}(${node.args.map(nodeToTree).join(', ')})`
}
