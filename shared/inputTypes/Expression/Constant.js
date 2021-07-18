const Expression = require('./abstracts/Expression')

const Parent = Expression
const defaultSO = { ...Parent.defaultSO }

class Constant extends Parent {
	constructor(SO) {
		if (typeof SO === 'string' || typeof SO === 'number')
			SO = { factor: parseFloat(SO) }
		super(SO)
	}

	toString(ignoreFactor = false) {
		return ignoreFactor ? '1' : this.factor.toString()
	}
	
	requiresBracketsFor(level, ignoreFactor = false) {
		if (ignoreFactor || this.factor >= 0)
			return false
		if (level === Expression.bracketLevels.addition || level === Expression.bracketLevels.multiplication)
			return false
		return true
	}

	dependsOn() {
		return false
	}

	getVariableStrings() {
		return new Set() // Empty set: there are no variables.
	}

	substitute() {
		return this.clone() // A constant does not change upon substitution.
	}

	simplify() {
		return this // You cannot simplify a number. It's as simple as it gets.
	}

	equals(expression, ignoreFactor = false) {
		if (expression.constructor !== this.constructor)
			return false
		return ignoreFactor || expression.factor === this.factor
	}

	getDerivative() {
		return new Constant(0) // The derivative of a constant is always zero.
	}
}
Constant.defaultSO = defaultSO
module.exports = Constant