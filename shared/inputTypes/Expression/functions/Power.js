const { processOptions } = require('../../../util/objects')

const Expression = require('../abstracts/Expression')
const Parent = require('../abstracts/FunctionMultiArgument')
const Constant = require('../abstracts/Constant')
const Integer = require('../Integer')
const Sum = require('../Sum')
const Product = require('../Product')
const Ln = require('./Ln')

const args = ['base', 'exponent']

class Power extends Parent {
	toNumber() {
		return Math.pow(this.base.toNumber(), this.exponent.toNumber())
	}

	toString() {
		// Get the base.
		let baseStr = this.base.toString()
		if (this.base.requiresBracketsFor(Expression.bracketLevels.powers))
			baseStr = `(${baseStr})`

		// Add the exponent.
		let exponentStr = this.exponent.toString()
		if (this.exponent.requiresBracketsFor(Expression.bracketLevels.powers))
			exponentStr = `(${exponentStr})`

		// Put them together.
		return `${baseStr}^${exponentStr}`
	}

	toTex() {
		// Get the base.
		let baseTex = this.base.tex
		if (this.base.requiresBracketsFor(Expression.bracketLevels.powers))
			baseTex = `\\left(${baseTex}\\right)`

		// Add the exponent. It never requires a bracket, because it's a superscript.
		let exponentTex = this.exponent.tex

		// Put them together.
		return `${baseTex}^{${exponentTex}}`
	}

	getDerivativeBasic(variable) {
		const terms = []

		// If the base depends on the variable, apply the default derivative rule, lowering the exponent by one.
		if (this.base.dependsOn(variable)) {
			// Lower the exponent of the power by one.
			const powerWithExponentOneLower = new Power(
				this.base,
				new Sum(this.exponent, -1),
			)

			// Assemble everything.
			terms.push(new Product(
				this.exponent, // Pre-multiply by the exponent.
				powerWithExponentOneLower, // Lower the exponent of the power by one.
				this.base.getDerivative(variable), // Apply the chain rule, multiplying by the derivative of the base.
			))
		}

		// If the exponent depends on the variable, apply the exponent derivative rule, multiplying by the logarithm of the base.
		if (this.exponent.dependsOn(variable)) {
			terms.push(new Product(
				new Ln(this.base),
				this, // Keep the power intact.
				this.exponent.getDerivative(variable), // Apply the chain rule on the exponent.
			))
		}

		// Return the outcome.
		return new Sum(...terms)
	}

	simplifyBasic(options) {
		let { base, exponent } = this.simplifyChildren(options)

		// Check for useless terms.
		if (options.removeUseless) {
			// If the power is 0, become 1.
			if (exponent.equalsBasic(Integer.zero))
				return Integer.one

			// If the power is 1, become the base.
			if (exponent.equalsBasic(Integer.one))
				return base
		}

		// ToDo: expand brackets.

		return new Power({ base, exponent })
	}
}
Power.defaultSO = Parent.getDefaultSO(args)
Power.args = args
Power.type = 'Power'
module.exports = Power