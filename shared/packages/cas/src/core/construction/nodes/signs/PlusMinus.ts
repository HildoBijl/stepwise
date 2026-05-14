import { ExpressionNode } from '../ExpressionNode'

import { Sign } from './Sign'

export class PlusMinus extends Sign {
	readonly subtype = 'PlusMinus'

	constructor(node: ExpressionNode) {
		super(node)
	}
}
