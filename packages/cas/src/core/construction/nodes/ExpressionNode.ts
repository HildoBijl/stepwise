import { lowerFirst } from '@step-wise/js-utils'

export abstract class ExpressionNode {
	abstract readonly subtype: string

	isSubtype(subtype: string | ExpressionNode | ExpressionNodeConstructor): boolean {
		if (typeof subtype === 'string') return this.subtype === subtype
		if (subtype instanceof ExpressionNode) return this.subtype === subtype.subtype
		return this.constructor === subtype
	}

	get name() {
		return lowerFirst(this.subtype)
	}

	get children(): readonly ExpressionNode[] {
		return []
	}

	recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		this.validateChildren(children, 0)
		return this
	}

	protected validateChildren(children: readonly ExpressionNode[], expectedCount?: number): void {
		if (!Array.isArray(children)) throw new TypeError(`Invalid children for "${this.subtype}": expected an array of ExpressionNodes.`)
		if (expectedCount !== undefined && children.length !== expectedCount) throw new Error(`Invalid children for "${this.subtype}": expected ${expectedCount}, but received ${children.length}.`)
		if (!children.every(child => child instanceof ExpressionNode)) throw new TypeError(`Invalid children for "${this.subtype}": every child must be an ExpressionNode.`)
	}
}

export type ExpressionNodeConstructor = abstract new (...args: never[]) => ExpressionNode
