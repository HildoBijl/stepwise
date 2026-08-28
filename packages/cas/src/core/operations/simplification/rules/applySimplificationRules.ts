import { type ExpressionNode } from '../../../construction/index.ts'

import { isFraction, isPower, isRootFunction, isZero } from '../../structural/index.ts'

import { type SimplificationContext, type SimplificationRule } from './types.ts'

// Apply a set of rules to a single node. Don't iterate to children or similar. Also don't simplify nodes that are invalid (e.g. a fraction with a zero denominator).
export function applySimplificationRules(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (isFraction(node) && isZero(node.denominator)) return node
	if (isPower(node) && isFraction(node.exponent) && isZero(node.exponent.denominator)) return node
	if (isRootFunction(node) && isZero(node.degree)) return node
	for (const rule of context.simplificationRules) node = applySimplificationRule(rule, node, context)
	return node
}

function applySimplificationRule<Name extends string, Node extends ExpressionNode>(rule: SimplificationRule<Name, Node>, node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return rule.appliesTo(node, context) ? rule.transform(node, context) : node
}
