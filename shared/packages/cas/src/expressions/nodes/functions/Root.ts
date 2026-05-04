import { ExpressionNode } from '../ExpressionNode'

import { FunctionNode } from './FunctionNode'

export class Root extends FunctionNode {
	static readonly argumentNames = ['argument', 'base'] as const
	readonly subtype = 'Root'

	constructor(argument: ExpressionNode, base: ExpressionNode) {
		super([argument, base])
	}

	get argument(): ExpressionNode {
		return this.args[0]
	}

	get base(): ExpressionNode {
		return this.args[1]
	}
}
