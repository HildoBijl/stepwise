import { type ExpressionNode } from '../../../construction'

import { type SimplificationContext } from '../simplificationOptions'

import { simplifySigns } from './signs'
import { simplifyConstants } from './constants'
import { simplifySums } from './sums'
import { simplifyProducts } from './products'
import { simplifyFractions } from './fractions'
import { simplifyPowers } from './powers'
import { simplifyRoots } from './roots'

export function applySimplificationRules(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	node = simplifySigns(node, context)
	node = simplifyConstants(node, context)
	node = simplifySums(node, context)
	node = simplifyProducts(node, context)
	node = simplifyFractions(node, context)
	node = simplifyPowers(node, context)
	node = simplifyRoots(node, context)
	return node
}
