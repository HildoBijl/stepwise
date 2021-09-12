// The Constant class is an abstract class inherited by classes like Integer and Float in the CAS.

const { decimalSeparatorTex } = require('../../../settings')
const { isInt } = require('../../../util/numbers')

const Expression = require('./Expression')

const Parent = Expression
const defaultSO = { ...Parent.defaultSO, value: 0 }

class Constant extends Parent {
	constructor(SO) {
		super(SO)

		// This class may not be instantiated.
		if (this.constructor === Constant)
			throw new TypeError(`Abstract class "Constant" may not be instantiated directly.`)

		// Process the number.
		this.value = SO.value
	}

	toString() {
		return this.toNumber().toString()
	}

	toTex() {
		return this.str.replace('.', decimalSeparatorTex)
	}

	requiresBracketsFor(level) {
		if (this.value >= 0)
			return false
		if (level === Expression.bracketLevels.addition || level === Expression.bracketLevels.multiplication)
			return false
		return true
	}

	requiresPlusInSum() {
		return this.value >= 0
	}

	dependsOn() {
		return false
	}

	getVariableStrings() {
		return new Set() // Empty set: there are no variables.
	}

	substituteBasic() {
		return this.clone() // A constant does not change upon substitution.
	}

	isNumeric() {
		return true
	}

	toNumber() {
		return this.value
	}

	getDerivativeBasic() {
		const Integer = require('../Integer')
		return Integer.zero // The derivative of a constant is always zero.
	}

	simplifyBasic() {
		return this // You cannot simplify a number. It's as simple as it gets.
	}

	equals(expression, options) {
		if (!(expression instanceof Constant))
			return false
		return expression.toNumber() === this.toNumber()
	}
}
Constant.defaultSO = defaultSO
Constant.type = 'Constant'
module.exports = Constant

Constant.toNumber = (number) => {
	if (isInt(number)) {
		const Integer = require('../Integer')
		return new Integer(number)
	}
	const Float = require('../Float')
	return new Float(number)
}