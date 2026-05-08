import { ExpressionNode } from '../../ExpressionNode'
import { Variable } from '../../Variable'

import { SingleArgumentFunctionNode } from '../abstracts'

export class Ln extends SingleArgumentFunctionNode {
	readonly subtype = 'Ln'

	constructor(argument: ExpressionNode) {
		super(argument)
	}

	get base(): ExpressionNode {
		return Variable.e
	}
}
