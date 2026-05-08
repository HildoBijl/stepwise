import { shallowEqual } from '@step-wise/utils'

import { ExpressionNode } from '../ExpressionNode'

export abstract class ListNode extends ExpressionNode {
	constructor(readonly terms: readonly ExpressionNode[]) {
		super()
	}

	override get children(): readonly ExpressionNode[] {
		return this.terms
	}

	override recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		if (shallowEqual(children, this.children)) return this
		return new (this.constructor as new (terms: readonly ExpressionNode[]) => this)(children)
	}
}
