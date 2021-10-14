const Parent = require('../abstracts/FunctionSingleArgument')
const Integer = require('../Integer')
const Product = require('../Product')

class Sin extends Parent {
	toNumber() {
		return Math.sin(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		const Cos = require('./Cos')
		return new Product(
			new Cos(this.argument),
			this.argument.getDerivative(variable), // Apply the chain rule.
		)
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			if (argument.equalsBasic(Integer.zero))
				return Integer.zero

			// ToDo: check for basic angles. (And same for cos and tan.)
		}

		return new Sin(argument)
	}
}
Sin.defaultSO = Parent.defaultSO
Sin.type = 'Sin'
module.exports = Sin