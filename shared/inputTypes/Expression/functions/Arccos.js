const Parent = require('../abstracts/FunctionSingleArgument')
const Sum = require('../Sum')
const Fraction = require('./Fraction')
const Power = require('./Power')
const Sqrt = require('./Sqrt')

class Arccos extends Parent {
	toNumber() {
		return Math.acos(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		// Set up 1 - arg^2.
		const inner = new Sum([
			1,
			new Power(this.argument, 2).multiplyBy(-1),
		])

		// Set up the result.
		return new Fraction({
			factor: -this.factor, // Keep the factor, but apply the minus.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(inner), // sqrt(1 - arg^2).
		})
	}
}
Arccos.defaultSO = Parent.defaultSO
module.exports = Arccos