const { getParentClass } = require('../../../../util/objects')

const { Integer, Function, Fraction, Ln, simplifyOptions } = require('../Expression')

/*
 * Log
 */

class Log extends Function {
	toNumber() {
		return Math.log(this.argument.toNumber()) / Math.log(this.base.toNumber())
	}

	toRawTex() {
		return `{^{${this.base.tex}}}\\!\\log\\left(${this.argument.tex}\\right)`
	}

	getDerivativeBasic(variable) {
		return this.simplifyBasic(simplifyOptions.forDerivatives).getDerivativeBasic(variable)
	}

	simplifyBasic(options) {
		let { argument, base } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.removeOneLogarithm) {
			if (Integer.one.equalsBasic(argument))
				return Integer.zero // If the argument is one, turn it into zero.
		}
		if (options.removeEqualBaseArgumentLogarithm) {
			if (base.equalsBasic(argument))
				return Integer.one // If the argument equals the base, turn it into one.
		}

		// For analysis reduce to only natural logarithms.
		if (options.turnLogIntoLn)
			return new Fraction(new Ln(argument), new Ln(base)).simplifyBasic(options)

		return new Log({ argument, base })
	}

	static getDefaultSO() {
		return {
			argument: Integer.one,
			base: Integer.ten,
			...getParentClass(this).getDefaultSO(),
		}
	}
}
Log.type = 'Log'
Log.args = ['argument', 'base']
module.exports.Log = Log
