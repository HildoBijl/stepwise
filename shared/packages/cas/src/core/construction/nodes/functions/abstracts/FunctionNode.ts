import { shallowEqual } from '@step-wise/utils'

import { ExpressionNode } from '../../ExpressionNode'

export abstract class FunctionNode extends ExpressionNode {
	static readonly argumentNames: readonly string[] = []

	constructor(readonly args: readonly ExpressionNode[]) {
		super()
	}

	get argumentNames(): readonly string[] {
		return (this.constructor as typeof FunctionNode).argumentNames
	}

	override get children(): readonly ExpressionNode[] {
		return this.args
	}

	override recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		if (shallowEqual(children, this.children)) return this
		return new (this.constructor as new (...args: ExpressionNode[]) => ExpressionNode)(...children)
	}
}
