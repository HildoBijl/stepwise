const Parent = require('../abstracts/FunctionSingleArgument')
const Fraction = require('./Fraction')

class Sqrt extends Parent {
	toNumber() {
		return Math.sqrt(this.argument.toNumber())
	}

	toTex() {
		return this.addFactorToTex(`\\sqrt{${this.argument.tex}}`)
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			factor: this.factor / 2, // Keep the factor, but divide by two because of the sqrt power.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(this.argument), // Put the sqrt in the denominator.
		})
	}

	simplify() {
		return this // ToDo: add this later.
	}
}
Sqrt.defaultSO = Sqrt.defaultSO
Sqrt.args = Sqrt.args
module.exports = Sqrt