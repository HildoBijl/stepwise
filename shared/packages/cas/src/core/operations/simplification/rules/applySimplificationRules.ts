import { type ExpressionNode } from '../../../construction'

import { type SimplificationContext } from '../simplificationOptions'

import { simplificationRuleEntries } from './simplificationRules'

export function applySimplificationRules(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	for (const [option, rule] of simplificationRuleEntries) {
		if (context.simplificationOptions.has(option) && rule.appliesTo(node, context)) node = rule.transform(node, context)
	}
	return node
}
