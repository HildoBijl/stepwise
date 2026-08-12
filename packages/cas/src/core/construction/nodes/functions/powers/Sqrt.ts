import { ExpressionNode } from '../../ExpressionNode'
import { Integer } from '../../constants'

import { SingleArgumentFunctionNode } from '../abstracts'

export class Sqrt extends SingleArgumentFunctionNode {
	static override readonly argumentNames: readonly string[] = ['radicand']
	readonly subtype = 'Sqrt'

	constructor(radicand: ExpressionNode) {
		super(radicand)
	}

	get radicand(): ExpressionNode {
		return this.argument
	}

	get degree(): ExpressionNode {
		return Integer.two
	}

	recreateWith(radicand: ExpressionNode): Sqrt {
		return this.recreateWithChildren([radicand]) as Sqrt
	}

	static readonly two = new Sqrt(Integer.two)
	static readonly three = new Sqrt(Integer.three)
	static readonly five = new Sqrt(Integer.five)
}
