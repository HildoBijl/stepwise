import { type ExpressionNode, namedConstants, product, fraction, sin, cos, tan, arcsin, arccos, arctan } from '../../../construction'

import { isSin, isCos, isTan, isArcsin, isArccos, isArctan, replaceDescendants } from '../../structural'

export function convertDegreesToRadians(node: ExpressionNode): ExpressionNode {
	return replaceDescendants(node, node => {
		if (isSin(node)) return sin(product(node.argument, fraction(namedConstants.pi, 180)))
		if (isCos(node)) return cos(product(node.argument, fraction(namedConstants.pi, 180)))
		if (isTan(node)) return tan(product(node.argument, fraction(namedConstants.pi, 180)))
		if (isArcsin(node)) return product(arcsin(node.argument), fraction(180, namedConstants.pi))
		if (isArccos(node)) return product(arccos(node.argument), fraction(180, namedConstants.pi))
		if (isArctan(node)) return product(arctan(node.argument), fraction(180, namedConstants.pi))
		return node
	})
}

export function convertRadiansToDegrees(node: ExpressionNode): ExpressionNode {
	return replaceDescendants(node, node => {
		if (isSin(node)) return sin(product(node.argument, fraction(180, namedConstants.pi)))
		if (isCos(node)) return cos(product(node.argument, fraction(180, namedConstants.pi)))
		if (isTan(node)) return tan(product(node.argument, fraction(180, namedConstants.pi)))
		if (isArcsin(node)) return product(arcsin(node.argument), fraction(namedConstants.pi, 180))
		if (isArccos(node)) return product(arccos(node.argument), fraction(namedConstants.pi, 180))
		if (isArctan(node)) return product(arctan(node.argument), fraction(namedConstants.pi, 180))
		return node
	})
}
