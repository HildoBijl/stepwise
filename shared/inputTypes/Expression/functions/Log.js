const Parent = require('../abstracts/FunctionMultiArgument')
const Fraction = require('./Fraction')
const Ln = require('./Ln')

const args = ['base', 'argument']

class Log extends Parent {
	getDerivativeBasic(variable) {
		// ToDo: check options.
		return this.simplify({ forDerivatives: true }).getDerivativeBasic(variable)
	}

	simplify(options) {
		// ToDo: check options.

		if (options.forDerivatives)
			return new Fraction(new Ln(this.argument), new Ln(this.base)).multiplyBy(this.factor).simplify(level)

		return this
	}

	// ToDo: equals.
}
Log.defaultSO = Parent.getDefaultSO(args)
Log.args = args
module.exports = Log