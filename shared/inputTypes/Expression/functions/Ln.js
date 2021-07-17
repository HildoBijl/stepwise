const Parent = require('../abstracts/FunctionSingleArgument')

class Ln extends Parent {
	getDerivative(variable) {
		variable = this.verifyVariable(variable)
		const Fraction = require('./Fraction')
		const arg = this.argument.eliminateFactor() // The factor has no influence on the derivative of the ln.
		return new Fraction({
			factor: this.factor,
			numerator: arg.getDerivative(variable), // Take the derivative according to the chain rule.
			denominator: arg, // Take 1/argument according to the derivative of ln(x).
		}).simplify()
	}

	simplify() {
		return this // ToDo: add this later.
	}
}
Ln.defaultSO = Parent.defaultSO
Ln.args = Parent.args
module.exports = Ln