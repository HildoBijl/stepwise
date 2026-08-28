import { shallowEqual } from '@step-wise/js-utils'

import { ExpressionNode } from '../../ExpressionNode.ts'

export abstract class FunctionNode extends ExpressionNode {
	static readonly argumentNames: readonly string[] = []
	readonly args: readonly ExpressionNode[]

	constructor(args: readonly ExpressionNode[]) {
		super()
		this.validateChildren(args, this.argumentNames.length)
		this.args = Object.freeze([...args])
	}

	get argumentNames(): readonly string[] {
		return (this.constructor as typeof FunctionNode).argumentNames
	}

	override get children(): readonly ExpressionNode[] {
		return this.args
	}

	override recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		this.validateChildren(children, this.argumentNames.length)
		if (shallowEqual(children, this.children)) return this
		return new (this.constructor as new (...args: ExpressionNode[]) => ExpressionNode)(...children)
	}
}
