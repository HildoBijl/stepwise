import { type ExpressionNode } from '../../../construction'

import { type SimplificationContext } from '../definitions'
import { simplifyConstants } from '../rules'

export function applySimplificationRules(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	node = simplifyConstants(node, context)
	// node = simplifySums(node, context)
	// node = simplifyProducts(node, context)
	// node = simplifyFractions(node, context)
	// node = simplifyPowers(node, context)
	// node = simplifyRoots(node, context)
	// node = simplifyLogarithms(node, context)
	// node = simplifyTrigonometry(node, context)
	return node
}
