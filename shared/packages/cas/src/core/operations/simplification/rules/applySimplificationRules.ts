import { type ExpressionNode } from '../../../construction'

import { type SimplificationContext } from '../simplificationOptions'

import { simplificationRuleEntries } from './simplificationRules'
import { type SimplificationRule } from './utils'

export function applySimplificationRules(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	for (const [option, rule] of simplificationRuleEntries) {
		if (context.simplificationOptions.has(option)) node = applySimplificationRule(rule, node, context)
	}
	return node
}

function applySimplificationRule<T extends ExpressionNode>(rule: SimplificationRule<T>, node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return rule.appliesTo(node, context) ? rule.transform(node, context) : node
}
