import { shallowEqual } from '@step-wise/js-utils'

import { ExpressionNode } from '../ExpressionNode.ts'

export abstract class ListNode extends ExpressionNode {
	readonly nodes: readonly ExpressionNode[]

	constructor(nodes: readonly ExpressionNode[]) {
		super()
		this.validateChildren(nodes)
		if (nodes.length < 2) throw new Error(`Invalid ListNode: received one with ${nodes.length} term(s). At least two nodes are required.`)
		this.nodes = Object.freeze([...nodes])
	}

	override get children(): readonly ExpressionNode[] {
		return this.nodes
	}

	override recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		if (shallowEqual(children, this.children)) return this
		return new (this.constructor as new (nodes: readonly ExpressionNode[]) => this)(children)
	}
}
