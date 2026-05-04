import { ExpressionNode } from '../ExpressionNode'

import { FunctionNode } from './FunctionNode'

export abstract class SingleArgumentFunctionNode extends FunctionNode {
	static readonly argumentNames = ['argument'] as const

	constructor(argument: ExpressionNode) {
		super([argument])
	}

	get argument(): ExpressionNode {
		return this.args[0]
	}
}
