const Parent = require('../abstracts/FunctionSingleArgument')
const Constant = require('../Constant')
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
		).multiplyBy(this.factor)
	}

	simplifyBasic(options) {
		let { factor, argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			if (argument.equals(Constant.zero))
				return Constant.zero

			// ToDo: check for basic angles. (And same for cos and tan.)
		}

		return new Sin({ factor, argument })
	}
}
Sin.defaultSO = Parent.defaultSO
Sin.type = 'Sin'
module.exports = Sin