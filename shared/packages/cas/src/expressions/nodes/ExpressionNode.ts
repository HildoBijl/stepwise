export abstract class ExpressionNode {
	readonly type = 'Expression'
	abstract readonly subtype: string

	get children(): readonly ExpressionNode[] {
		return []
	}

	isSubtype(subtype: string | ExpressionNode | ExpressionNodeConstructor): boolean {
		if (typeof subtype === 'string') return this.subtype === subtype
		if (subtype instanceof ExpressionNode) return this.subtype === subtype.subtype
		return this.constructor === subtype
	}
}

export type ExpressionNodeConstructor = abstract new (...args: never[]) => ExpressionNode
