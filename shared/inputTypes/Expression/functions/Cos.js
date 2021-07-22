const Parent = require('../abstracts/FunctionSingleArgument')
const Product = require('../Product')

class Cos extends Parent {
	toNumber() {
		return Math.cos(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		const Sin = require('./Sin')
		return new Product(
			new Sin(this.argument),
			this.argument.getDerivative(variable), // Apply the chain rule.
		).multiplyBy(-this.factor) // Include a minus here.
	}
}
Cos.defaultSO = Parent.defaultSO
module.exports = Cos