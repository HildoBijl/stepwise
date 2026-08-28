import { type ExpressionNode } from '../../ExpressionNode.ts'
import { namedConstants } from '../../constants/index.ts'

import { SingleArgumentFunctionNode } from '../abstracts/index.ts'

export class Ln extends SingleArgumentFunctionNode {
	readonly subtype = 'Ln'

	constructor(argument: ExpressionNode) {
		super(argument)
	}

	get base(): ExpressionNode {
		return namedConstants.e
	}
}
