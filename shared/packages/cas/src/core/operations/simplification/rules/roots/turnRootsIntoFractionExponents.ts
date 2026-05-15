import { type ExpressionNode, type RootLike, fraction, power } from '../../../../construction'

export function turnRootsIntoFractionExponents(node: RootLike): ExpressionNode {
	return power(node.radicand, fraction(1, node.degree))
}
