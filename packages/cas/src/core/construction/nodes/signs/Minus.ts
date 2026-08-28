import { ExpressionNode } from '../ExpressionNode.ts'

import { SignNode } from './SignNode.ts'

export class Minus extends SignNode {
	readonly subtype = 'Minus'

	constructor(node: ExpressionNode) {
		super(node)
	}
}
