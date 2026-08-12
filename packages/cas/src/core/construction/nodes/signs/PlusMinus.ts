import { ExpressionNode } from '../ExpressionNode'

import { SignNode } from './SignNode'

export class PlusMinus extends SignNode {
	readonly subtype = 'PlusMinus'

	constructor(node: ExpressionNode) {
		super(node)
	}
}
