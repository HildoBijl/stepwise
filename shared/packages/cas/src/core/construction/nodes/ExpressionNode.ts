export abstract class ExpressionNode {
	abstract readonly subtype: string

	isSubtype(subtype: string | ExpressionNode | ExpressionNodeConstructor): boolean {
		if (typeof subtype === 'string') return this.subtype === subtype
		if (subtype instanceof ExpressionNode) return this.subtype === subtype.subtype
		return this.constructor === subtype
	}

	get name() {
		return this.subtype.toLowerCase()
	}

	get children(): readonly ExpressionNode[] {
		return []
	}

	recreateWithChildren(children: readonly ExpressionNode[]): ExpressionNode {
		if (children.length !== 0) throw new Error(`Cannot recreate "${this.subtype}" with children.`)
		return this
	}
}

export type ExpressionNodeConstructor = abstract new (...args: never[]) => ExpressionNode
