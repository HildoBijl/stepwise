import { ExpressionNode } from '../ExpressionNode'

export abstract class FunctionNode extends ExpressionNode {
	static readonly argumentNames: readonly string[] = []

	constructor(readonly args: readonly ExpressionNode[]) {
		super()
	}

	override get children(): readonly ExpressionNode[] {
		return this.args
	}

	get argumentNames(): readonly string[] {
		return (this.constructor as typeof FunctionNode).argumentNames
	}
}
