const Parent = require('../abstracts/FunctionSingleArgument')
const Product = require('../Product')

class Sin extends Parent {
	toNumber() {
		return Math.sin(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		const Cos = require('./Cos')
		return new Product({
			factor: this.factor,
			terms: [
				new Cos(this.argument),
				this.argument.getDerivative(variable), // Apply the chain rule.
			],
		})
	}

	simplify() {
		return this // ToDo: add this later.
	}
}
Sin.defaultSO = Parent.defaultSO
module.exports = Sin