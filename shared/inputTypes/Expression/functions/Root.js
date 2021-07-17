const Parent = require('../abstracts/FunctionMultiArgument')
const Fraction = require('./Fraction')
const Power = require('./Power')

const args = ['base', 'argument']

class Root extends Parent {
	getDerivative(variable) {
		return this.simplify().getDerivative(variable)
	}

	simplify(level) {
		// ToDo: check level.
		return new Power(this.argument, new Fraction(1, this.base)).multiplyBy(this.factor).simplify(level)
	}

	// ToDo: equals.
}
Root.defaultSO = Parent.getDefaultSO(args)
Root.args = args
module.exports = Root