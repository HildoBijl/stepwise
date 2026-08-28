import { ExpressionNode } from '../ExpressionNode.ts'

export abstract class SignNode extends ExpressionNode {
	readonly node: ExpressionNode

	constructor(node: ExpressionNode) {
		super()
		this.validateChildren([node], 1)
		this.node = node
	}

	override get children(): readonly ExpressionNode[] {
		return [this.node]
	}

	override recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		this.validateChildren(children, 1)
		if (children[0] === this.node) return this
		return this.recreateWith(children[0])
	}

	recreateWith(node: ExpressionNode): ExpressionNode {
		return new (this.constructor as new (node: ExpressionNode) => ExpressionNode)(node)
	}
}
