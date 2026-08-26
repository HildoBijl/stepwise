import { type AccentName, accentNames } from '@step-wise/math-input-value'

import { ExpressionNode } from './ExpressionNode'

export class Variable extends ExpressionNode {
	readonly subtype = 'Variable'

	constructor(readonly symbol: string, readonly subscript?: string, readonly accent?: AccentName) {
		super()
		if (symbol.length === 0) throw new Error('Invalid variable symbol: the symbol must be non-empty.')
		if (accent !== undefined && !accentNames.includes(accent)) throw new Error(`Invalid variable accent: the accent "${accent}" is unknown.`)
	}
}
