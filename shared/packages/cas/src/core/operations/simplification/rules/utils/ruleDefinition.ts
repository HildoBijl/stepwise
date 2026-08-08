import { type ExpressionNode } from '../../../../construction'

import { type SimplificationContext, type SimplificationOption } from '../../simplificationOptions'

export type SimplificationRule<T extends ExpressionNode> = {
	appliesTo: (node: ExpressionNode, context: SimplificationContext) => node is T
	transform: (node: T, context: SimplificationContext) => ExpressionNode
	requires?: readonly SimplificationOption[]
	conflictsWith?: readonly SimplificationOption[]
}

export type AnySimplificationRule = SimplificationRule<any>

export function defineRule<T extends ExpressionNode>(rule: SimplificationRule<T>): SimplificationRule<T> {
	return rule
}
