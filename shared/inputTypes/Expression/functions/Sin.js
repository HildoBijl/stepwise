const Parent = require('../abstracts/FunctionSingleArgument')
const Product = require('../Product')

class Sin extends Parent {
	getDerivative(variable) {
		variable = this.verifyVariable(variable)
		const Cos = require('./Cos')
		return new Product({
			factor: this.factor,
			terms: [
				new Cos(this.argument),
				this.argument.getDerivative(variable), // Apply the chain rule.
			],
		}).simplify()
	}

	simplify() {
		return this // ToDo: add this later.
	}
}
Sin.defaultSO = Parent.defaultSO
module.exports = Sin