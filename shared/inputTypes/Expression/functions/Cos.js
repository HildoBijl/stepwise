const Parent = require('../abstracts/FunctionSingleArgument')
const Product = require('../Product')

class Cos extends Parent {
	toNumber() {
		return Math.cos(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		const Sin = require('./Sin')
		return new Product({
			factor: -this.factor, // Apply a minus.
			terms: [
				new Sin(this.argument),
				this.argument.getDerivative(variable), // Apply the chain rule.
			],
		})
	}

	simplify() {
		return this // ToDo: add this later.
	}
}
Cos.defaultSO = Parent.defaultSO
module.exports = Cos