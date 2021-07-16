const Expression = require('./Expression')

const defaultSO = { ...Expression.defaultSO }

class Constant extends Expression {
	toString(ignoreFactor = false) {
		return ignoreFactor ? '1' : this.factor.toString()
	}

	dependsOn() {
		return false
	}

	getVariables() {
		return []
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