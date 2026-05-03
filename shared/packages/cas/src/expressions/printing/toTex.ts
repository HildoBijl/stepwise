import { decimalSeparatorTex } from '../../settings'

import { ExpressionNode, Constant } from '../nodes'

export function toTex(node: ExpressionNode) {
	if (node instanceof Constant) return `${node.value}`.replace('.', decimalSeparatorTex)

	throw new Error(`Invalid toTex call: have not implemented the toTex function yet for expressions of subtype "${node.subtype}".`)
}
