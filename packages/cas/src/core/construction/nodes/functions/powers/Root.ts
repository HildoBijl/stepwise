import { ExpressionNode } from '../../ExpressionNode'

import { FunctionNode } from '../abstracts'

import { type Sqrt } from './Sqrt'

export type RootLike = Root | Sqrt

export class Root extends FunctionNode {
	static readonly argumentNames = ['radicand', 'degree'] as const
	readonly subtype = 'Root'

	constructor(radicand: ExpressionNode, degree: ExpressionNode) {
		super([radicand, degree])
	}

	get radicand(): ExpressionNode {
		return this.args[0]
	}

	get degree(): ExpressionNode {
		return this.args[1]
	}

	recreateWith(radicand: ExpressionNode, degree: ExpressionNode = this.degree): Root {
		return this.recreateWithChildren([radicand, degree]) as Root
	}
}
