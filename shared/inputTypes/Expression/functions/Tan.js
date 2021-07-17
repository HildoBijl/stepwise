const Parent = require('../abstracts/FunctionSingleArgument')
const Product = require('../Product')
const Fraction = require('./Fraction')
const Sin = require('./Sin')
const Cos = require('./Cos')

class Tan extends Parent {
	getDerivative(variable) {
		variable = this.verifyVariable(variable)
		return new Fraction({
			factor: this.factor, // Keep the factor.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Power(new Cos(this.argument), 2), // Use 1/cos(arg)^2.
		}).simplify()
	}

	simplify(level) {
		return Fraction({
			factor: this.factor,
			num: Sin(this.argument),
			den: Cos(this.argument),
		}).simplify(level)
	}
}
Tan.defaultSO = Parent.defaultSO
module.exports = Tan