
import { ExpressionNode } from '../ExpressionNode'

import { Function } from './Function'

export class Power extends Function {
	static readonly argumentNames = ['base', 'exponent'] as const
	readonly subtype = 'Power'

	constructor(base: ExpressionNode, exponent: ExpressionNode) {
		super([base, exponent])
	}

	get base(): ExpressionNode {
		return this.args[0]
	}

	get exponent(): ExpressionNode {
		return this.args[1]
	}
}
