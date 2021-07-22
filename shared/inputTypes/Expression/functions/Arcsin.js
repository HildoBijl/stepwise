const Parent = require('../abstracts/FunctionSingleArgument')
const Sum = require('../Sum')
const Fraction = require('./Fraction')
const Power = require('./Power')
const Sqrt = require('./Sqrt')

class Arcsin extends Parent {
	toNumber() {
		return Math.asin(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		// Set up 1 - arg^2.
		const inner = new Sum([
			1,
			new Power(this.argument, 2).multiplyBy(-1),
		])

		// Set up the result.
		return new Fraction({
			factor: this.factor, // Keep the factor.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(inner), // sqrt(1 - arg^2).
		})
	}

	simplify() {
		return this // ToDo: add this later.
	}
}
Arcsin.defaultSO = Parent.defaultSO
module.exports = Arcsin