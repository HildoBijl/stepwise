import { type ExpressionNode } from '../../../../construction'

import { type SimplificationContext } from '../../simplificationOptions'

export type SimplificationRule = {
	appliesTo: (node: ExpressionNode, context: SimplificationContext) => boolean
	transform: (node: ExpressionNode, context: SimplificationContext) => ExpressionNode
}

type RuleDefinition<T extends ExpressionNode> = {
	appliesTo: (node: ExpressionNode, context: SimplificationContext) => node is T
	transform: (node: T, context: SimplificationContext) => ExpressionNode
}

// The predicate is responsible for narrowing the node to the type accepted by the transform.
export function defineRule<T extends ExpressionNode>({ appliesTo, transform }: RuleDefinition<T>): SimplificationRule {
	return {
		appliesTo,
		transform: (node, context) => transform(node as T, context),
	}
}
