const Expression = require('./Expression')
const { roundToDigits } = require('../../util/numbers')

const defaultSO = { ...Expression.defaultSO }

class Constant extends Expression {
	toString(omitMinus = false) {
		return `${roundToDigits(omitMinus ? Math.abs(this.factor) : this.factor, 3)}`
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
}
Constant.defaultSO = defaultSO
module.exports = Constant