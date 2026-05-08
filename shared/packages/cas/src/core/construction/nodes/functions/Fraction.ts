import { ExpressionNode } from '../ExpressionNode'
import { Integer } from '../constants'

import { FunctionNode } from './abstracts'

export class Fraction extends FunctionNode {
	static readonly argumentNames = ['numerator', 'denominator'] as const
	readonly subtype = 'Fraction'

	constructor(numerator: ExpressionNode, denominator: ExpressionNode) {
		super([numerator, denominator])
	}

	get numerator(): ExpressionNode {
		return this.args[0]
	}

	get denominator(): ExpressionNode {
		return this.args[1]
	}

	static readonly half = new Fraction(Integer.one, Integer.two)
	static readonly third = new Fraction(Integer.one, Integer.three)
	static readonly quarter = new Fraction(Integer.one, Integer.four)
	static readonly fifth = new Fraction(Integer.one, Integer.five)
	static readonly sixth = new Fraction(Integer.one, Integer.six)
	static readonly tenth = new Fraction(Integer.one, Integer.ten)
	static readonly hundredth = new Fraction(Integer.one, Integer.hundred)
}
