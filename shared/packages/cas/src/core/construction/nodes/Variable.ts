import { ExpressionNode } from './ExpressionNode'

export type Accent = typeof Variable.accents[number]
export class Variable extends ExpressionNode {
	readonly subtype = 'Variable'
	static readonly accents = ['dot', 'hat'] as const

	constructor(readonly symbol: string, readonly subscript?: string, readonly accent?: Accent) {
		super()
		if (symbol.length === 0) throw new Error('Invalid variable symbol: the symbol must be non-empty.')
		if (accent !== undefined && !Variable.accents.includes(accent)) throw new Error(`Invalid variable accent: the accent "${accent}" is unknown.`)
	}

	static readonly e = new Variable('e')
	static readonly pi = new Variable('π')
	static readonly infinity = new Variable('∞')
}
