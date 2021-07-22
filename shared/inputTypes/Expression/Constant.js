const { decimalSeparator, decimalSeparatorTex } = require('../../settings')

const Expression = require('./abstracts/Expression')

const Parent = Expression
const defaultSO = { ...Parent.defaultSO }

class Constant extends Parent {
	constructor(SO) {
		if (typeof SO === 'string')
			SO = { factor: parseFloat(SO.replace(decimalSeparator, '.')) }
		else if (typeof SO === 'number')
			SO = { factor: SO }
		super(SO)
	}

	toString() {
		return this.factor.toString()
	}

	toTex() {
		return this.str.replace('.', decimalSeparatorTex)
	}

	requiresBracketsFor(level) {
		if (this.factor >= 0)
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

	isNumeric() {
		return true
	}

	toNumber() {
		return this.factor
	}

	getDerivativeBasic() {
		return new Constant(0) // The derivative of a constant is always zero.
	}

	simplifyBasic() {
		return this // You cannot simplify a number. It's as simple as it gets.
	}

	equals(expression, options) {
		// ToDo
		if (expression.constructor !== this.constructor)
			return false
		return expression.factor === this.factor
	}
}
Constant.defaultSO = defaultSO
module.exports = Constant

Constant.zero = new Constant(0)
Constant.one = new Constant(1)