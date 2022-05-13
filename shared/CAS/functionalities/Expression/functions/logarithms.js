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
		return this.simplify(simplifyOptions.forDerivatives).getDerivativeBasic(variable)
	}

	simplifyBasic(options) {
		let { argument, base } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			// If the argument is one, turn it into zero.
			if (Integer.one.equalsBasic(argument))
				return Integer.zero

			// If the argument equals the base, turn it into one.
			if (base.equalsBasic(argument))
				return Integer.one
		}

		// For analysis reduce to only natural logarithms.
		if (options.toBasicForm)
			return new Fraction(new Ln(argument), new Ln(base)).simplifyBasic(options)

		return new Log({ argument, base })
	}

	static getDefaultSO() {
		return {
			argument: Integer.one,
			base: Integer.ten,
		}
	}
}
Log.type = 'Log'
Log.args = ['argument', 'base']
module.exports.Log = Log
