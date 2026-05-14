import { ExpressionNode } from '../ExpressionNode'

export abstract class SignNode extends ExpressionNode {
	constructor(readonly node: ExpressionNode) {
		super()
	}

	override get children(): readonly ExpressionNode[] {
		return [this.node]
	}

	override recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		if (children[0] === this.node) return this
		return this.recreateWith(children[0])
	}

	recreateWith(node: ExpressionNode): ExpressionNode {
		return new (this.constructor as new (node: ExpressionNode) => ExpressionNode)(node)
	}
}
