import { ExpressionNode } from '../ExpressionNode'

export abstract class ExpressionList extends ExpressionNode {
	constructor(readonly terms: readonly ExpressionNode[]) {
		super()
	}

	override get children(): readonly ExpressionNode[] {
		return this.terms
	}
}
