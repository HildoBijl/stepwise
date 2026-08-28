import { ExpressionNode } from '../ExpressionNode.ts'

import { SignNode } from './SignNode.ts'

export class PlusMinus extends SignNode {
	readonly subtype = 'PlusMinus'

	constructor(node: ExpressionNode) {
		super(node)
	}
}
