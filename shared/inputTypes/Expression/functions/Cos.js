const Parent = require('../abstracts/FunctionSingleArgument')
const Product = require('../Product')

class Cos extends Parent {
	getDerivative(variable) {
		variable = this.verifyVariable(variable)
		const Sin = require('./Sin')
		return new Product({
			factor: -this.factor, // Apply a minus.
			terms: [
				new Sin(this.argument),
				this.argument.getDerivative(variable), // Apply the chain rule.
			],
		}).simplify()
	}

	simplify() {
		return this // ToDo: add this later.
	}
}
Cos.defaultSO = Parent.defaultSO
module.exports = Cos