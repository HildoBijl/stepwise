import { ExpressionNode } from '../../ExpressionNode.ts'

import { FunctionNode } from '../abstracts/index.ts'

import { type Ln } from './Ln.ts'

export type LogarithmFunction = Log | Ln

export class Log extends FunctionNode {
	static readonly argumentNames = ['argument', 'base'] as const
	readonly subtype = 'Log'

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
