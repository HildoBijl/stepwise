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
			factor: this.factor, // Keep the factor.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(this.argument).multiplyBy(2), // Put the sqrt in the denominator. Multiply by 2 because of the square root derivative rule.
		})
	}
}
Sqrt.defaultSO = Sqrt.defaultSO
Sqrt.args = Sqrt.args
module.exports = Sqrt