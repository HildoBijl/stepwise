import { ExpressionNode } from './ExpressionNode'

export class Variable extends ExpressionNode {
	readonly subtype = 'Variable'

	constructor(readonly symbol: string, readonly subscript?: string, readonly accent?: string) {
		super()
		if (symbol.length === 0) throw new Error('Invalid variable symbol: the symbol must be non-empty.')
	}

	static readonly e = new Variable('e')
	static readonly pi = new Variable('π')
	static readonly infinity = new Variable('∞')
}
