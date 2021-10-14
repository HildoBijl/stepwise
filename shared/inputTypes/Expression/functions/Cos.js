const Parent = require('../abstracts/FunctionSingleArgument')
const Product = require('../Product')
const Integer = require('../Integer')

class Cos extends Parent {
	toNumber() {
		return Math.cos(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		const Sin = require('./Sin')
		return new Product(
			Integer.minusOne,
			new Sin(this.argument),
			this.argument.getDerivative(variable), // Apply the chain rule.
		)
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			if (argument.equalsBasic(Integer.zero))
				return Integer.one

			// ToDo: check for basic angles. (And same for cos and tan.)
		}

		return new Cos(argument)
	}
}
Cos.defaultSO = Parent.defaultSO
Cos.type = 'Cos'
module.exports = Cos