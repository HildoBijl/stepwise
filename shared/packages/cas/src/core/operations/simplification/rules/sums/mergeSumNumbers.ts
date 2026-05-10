import { sum } from '@step-wise/utils'

import { Integer, Float, Sum } from '../../../../construction'

import { isConstantNode, isFloatNode } from '../../../structural'

export function mergeSumNumbers(node: Sum): Sum {
	const constants = node.terms.filter(isConstantNode)
	if (constants.length <= 1) return node
	const value = sum(constants.map(term => term.value))
	const terms = node.terms.filter(term => !isConstantNode(term))
	terms.push(constants.some(isFloatNode) ? new Integer(value) : new Float(value))
	return new Sum(terms)
}
