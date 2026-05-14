import { ExpressionNode } from '../ExpressionNode'

import { Sign } from './Sign'

export class Minus extends Sign {
	readonly subtype = 'Minus'

	constructor(node: ExpressionNode) {
		super(node)
	}
}
