const Parent = require('../abstracts/FunctionMultiArgument')
const Fraction = require('./Fraction')
const Ln = require('./Ln')

const args = ['base', 'argument']

class Log extends Parent {
	getDerivativeBasic(variable) {
		// ToDo: check level.
		return this.simplify().getDerivativeBasic(variable)
	}

	simplify(level) {
		// ToDo: check level.
		return new Fraction(new Ln(this.argument), new Ln(this.base)).multiplyBy(this.factor).simplify(level)
	}

	// ToDo: equals.
}
Log.defaultSO = Parent.getDefaultSO(args)
Log.args = args
module.exports = Log