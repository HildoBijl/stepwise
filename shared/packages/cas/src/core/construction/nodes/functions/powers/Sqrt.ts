import { ExpressionNode } from '../../ExpressionNode'
import { Integer } from '../../constants'

import { SingleArgumentFunctionNode } from '../SingleArgumentFunctionNode'

export class Sqrt extends SingleArgumentFunctionNode {
	readonly subtype = 'Sqrt'

	constructor(argument: ExpressionNode) {
		super(argument)
	}

	get base(): ExpressionNode {
		return Integer.two
	}

	static readonly two = new Sqrt(Integer.two)
	static readonly three = new Sqrt(Integer.three)
	static readonly five = new Sqrt(Integer.five)
}
