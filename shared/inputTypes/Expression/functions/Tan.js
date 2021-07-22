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

	simplify(options) {
		return Fraction(Sin(this.argument), Cos(this.argument)).multiplyBy(this.factor).simplify(options)
	}
}
Tan.defaultSO = Parent.defaultSO
module.exports = Tan