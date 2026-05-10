import { ExpressionNode } from '../ExpressionNode'

export class Sign extends ExpressionNode {
	readonly subtype = 'Sign'

	constructor(readonly node: ExpressionNode, readonly negative: boolean = false, readonly plusMinus: boolean = false) {
		super()
		if (!negative && !plusMinus) throw new Error(`Sign object that is neither negative nor a plus-minus is not allowed.`)
	}

	override get children(): readonly ExpressionNode[] {
		return [this.node]
	}

	override recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		if (children[0] === this.node) return this
		return new Sign(children[0], this.negative, this.plusMinus)
	}

	recreateWith(node: ExpressionNode): ExpressionNode {
		return this.recreateWithChildren([node])
	}
}
