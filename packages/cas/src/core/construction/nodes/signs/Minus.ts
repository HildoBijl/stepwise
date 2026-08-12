import { ExpressionNode } from '../ExpressionNode'

import { SignNode } from './SignNode'

export class Minus extends SignNode {
	readonly subtype = 'Minus'

	constructor(node: ExpressionNode) {
		super(node)
	}
}
