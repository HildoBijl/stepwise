import { type AccentName, accentNames } from '@step-wise/math-input-value'

import { ExpressionNode } from './ExpressionNode'

export class Variable extends ExpressionNode {
	readonly subtype = 'Variable'

	constructor(readonly symbol: string, readonly subscript?: string, readonly accent?: AccentName) {
		super()
		if (symbol.length === 0) throw new Error('Invalid variable symbol: the symbol must be non-empty.')
		if (/[()_]/.test(symbol)) throw new Error(`Invalid variable symbol "${symbol}": symbols cannot contain parentheses or underscores.`)
		if (subscript !== undefined && subscript.length === 0) throw new Error('Invalid variable subscript: an explicitly provided subscript must be non-empty.')
		if (subscript !== undefined && /[()]/.test(subscript)) throw new Error(`Invalid variable subscript "${subscript}": subscripts cannot contain parentheses.`)
		if (accent !== undefined && !accentNames.includes(accent)) throw new Error(`Invalid variable accent: the accent "${accent}" is unknown.`)
	}
}
