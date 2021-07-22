const Parent = require('../abstracts/FunctionSingleArgument')
const Fraction = require('./Fraction')
const Sin = require('./Sin')
const Cos = require('./Cos')

class Tan extends Parent {
	toNumber() {
		return Math.tan(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			factor: this.factor, // Keep the factor.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Power(new Cos(this.argument), 2), // Use 1/cos(arg)^2.
		})
	}

	simplifyBasic(options) {
		let { factor, argument } = this.simplifyChildren(options)

		// ToDo: check basic cases.

		// Check for analysis reductions.
		if (options.forAnalysis)
			return Fraction(Sin(argument), Cos(argument)).multiplyBy(factor).simplify(options)

		return new Tan({ factor, argument })
	}
}
Tan.defaultSO = Parent.defaultSO
module.exports = Tan