import { shallowEqual } from '@step-wise/utils'

import { ExpressionNode } from '../ExpressionNode'

export abstract class ListNode extends ExpressionNode {
	constructor(readonly nodes: readonly ExpressionNode[]) {
		super()
		if (nodes.length < 2) throw new Error(`Invalid ListNode: received one with ${nodes.length} term(s). At least two nodes are required.`)
	}

	override get children(): readonly ExpressionNode[] {
		return this.nodes
	}

	override recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		if (shallowEqual(children, this.children)) return this
		return new (this.constructor as new (nodes: readonly ExpressionNode[]) => this)(children)
	}
}
