import { decimalSeparator } from '../../settings'

import { ExpressionNode, Constant, Float } from '../nodes'

export function toString(node: ExpressionNode) {
	if (node instanceof Constant) return `${node.value}`.replace('.', decimalSeparator)

	throw new Error(`Invalid toString call: have not implemented the toString function yet for expressions of subtype "${node.subtype}".`)
}
