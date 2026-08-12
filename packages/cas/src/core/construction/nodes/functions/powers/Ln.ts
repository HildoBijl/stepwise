import { type ExpressionNode } from '../../ExpressionNode'
import { namedConstants } from '../../constants'

import { SingleArgumentFunctionNode } from '../abstracts'

export class Ln extends SingleArgumentFunctionNode {
	readonly subtype = 'Ln'

	constructor(argument: ExpressionNode) {
		super(argument)
	}

	get base(): ExpressionNode {
		return namedConstants.e
	}
}
