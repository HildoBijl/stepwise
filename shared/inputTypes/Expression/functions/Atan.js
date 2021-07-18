const Parent = require('../abstracts/FunctionSingleArgument')
const Sum = require('../Sum')
const Fraction = require('./Fraction')
const Power = require('./Power')

class Atan extends Parent {
	getDerivativeBasic(variable) {
		return new Fraction({
			factor: this.factor, // Keep the factor.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sum([1, new Power(this.argument, 2)]), // 1 + arg^2.
		})
	}

	simplify() {
		return this // ToDo: add this later.
	}
}
Atan.defaultSO = Parent.defaultSO
module.exports = Atan