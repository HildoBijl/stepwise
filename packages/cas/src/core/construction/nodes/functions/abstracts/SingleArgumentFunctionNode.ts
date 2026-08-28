import { ExpressionNode } from '../../ExpressionNode.ts'

import { FunctionNode } from './FunctionNode.ts'

export abstract class SingleArgumentFunctionNode extends FunctionNode {
	static override readonly argumentNames: readonly string[] = ['argument']

	constructor(argument: ExpressionNode) {
		super([argument])
	}

	get argument(): ExpressionNode {
		return this.args[0]
	}
}
