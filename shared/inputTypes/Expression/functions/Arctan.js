const Parent = require('../abstracts/FunctionSingleArgument')
const Sum = require('../Sum')
const Fraction = require('./Fraction')
const Power = require('./Power')

class Arctan extends Parent {
	toNumber() {
		return Math.atan(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			factor: this.factor, // Keep the factor.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sum([1, new Power(this.argument, 2)]), // 1 + arg^2.
		})
	}

	simplifyBasic(options) {
		let { factor, argument } = this.simplifyChildren(options)

		// ToDo

		return new Arctan({ factor, argument })
	}
}
Arctan.defaultSO = Parent.defaultSO
Arctan.type = 'Arctan'
module.exports = Arctan