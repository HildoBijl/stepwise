const Expression = require('../abstracts/Expression')
const Parent = require('../abstracts/FunctionMultiArgument')
const Sum = require('../Sum')
const Product = require('../Product')
const Ln = require('./Ln')

const args = ['base', 'exponent']

class Power extends Parent {
	toString(ignoreFactor = false) {
		// Get the base.
		let baseStr = this.base.toString()
		if (this.base.requiresBracketsFor(Expression.bracketLevels.powers))
			baseStr = `(${baseStr})`

		// Add the exponent.
		let exponentStr = this.exponent.toString()
		if (this.exponent.requiresBracketsFor(Expression.bracketLevels.powers))
			exponentStr = `(${exponentStr})`

		// Put them together.
		let result = `${baseStr}^${exponentStr}`

		// Add the factor.
		if (!ignoreFactor)
			result = this.addFactorToString(result)

		return result
	}

	getDerivative(variable) {
		variable = this.verifyVariable(variable)
		const terms = []

		// For the simple cases, simplify the power first.
		if (this.exponent.equals(0) || this.exponent.equals(1))
			return this.simplify().getDerivative(variable)

		// If the base depends on the variable, apply the default derivative rule, lowering the exponent by one.
		if (this.base.dependsOn(variable)) {
			// Lower the exponent of the power by one.
			const powerWithExponentOneLower = new Power(
				this.base,
				new Sum(this.exponent, -1),
			)

			// Assemble everything.
			const derivative = new Product(
				this.exponent, // Pre-multiply by the exponent.
				powerWithExponentOneLower, // Lower the exponent of the power by one.
				this.base.getDerivative(variable), // Apply the chain rule, multiplying by the derivative of the base.
			).simplify()
			terms.push(derivative)
		}

		// If the exponent depends on the variable, apply the exponent derivative rule, multiplying by the logarithm of the base.
		if (this.exponent.dependsOn(variable)) {
			const derivative = new Product(
				new Ln(this.base),
				this, // Keep the power intact.
				this.exponent.getDerivative(variable), // Apply the chain rule on the exponent.
			).simplify()
			terms.push(derivative)
		}

		// Return the outcome.
		return new Sum(...terms).multiplyBy(this.factor).simplify()
	}

	simplify(level) {
		// If the power is 0, become the factor.
		if (this.exponent.equals(0))
			return new Constant(this.factor)

		// If the power is 1, become the base.
		if (this.exponent.equals(1))
			return this.base.simplify(level).multiplyBy(this.factor)

		return this // ToDo: implement later.
	}

	// simplify() {

	// 	// Okay, stuff is more complicated. First, let's create a clone so we can work safely.
	// 	let result = this.clone()
	// 	result.base = result.base.simplify()

	// 	// If the base is a number, just calculate it. (This must be after the base was simplified.)
	// 	if (result.base instanceof Constant)
	// 		return new Constant(this.factor * (result.base.factor ** this.power))

	// 	// If the base has a factor, pull it out. Then we don't need to worry about it later.
	// 	if (result.base.factor !== 1) {
	// 		result.factor = result.factor * (result.base.factor ** result.power)
	// 		result.base.factor = 1
	// 	}

	// 	// If the base is a power as well, merge the powers. So 3*(2*x^2)*3 becomes 24*x^6.
	// 	if (result.base instanceof Power)
	// 		result = new Power(result.base.base, result.power * result.base.power, result.factor)

	// 	// If the base is a product, expand the brackets. So 2*(3*x^2*y)^3 becomes 54*x^6*y^3.
	// 	if (result.base instanceof Product) {
	// 		const terms = result.base.terms.map(term => new Power(term, result.power).simplify())
	// 		return new Product(terms, result.factor)
	// 	}

	// 	// All done! Return the result 
	// 	return result
	// }

	// equals(expression, ignoreFactor = false) {
	// 	if (expression.constructor !== this.constructor)
	// 		return false
	// 	return (ignoreFactor || expression.factor === this.factor) && expression.power === this.power && expression.base.equals(this.base)
	// }

	// getNumFunctions() {
	// 	return this.base.getNumFunctions() * this.power
	// }

	// getPolynomialDegree() {
	// 	return this.base.getPolynomialDegree() * this.power
	// }

	// // expand will expand the brackets of the power. For example, the term (x + 2)^3 will be x^3 + 6*x^2 + 12*x + 8.
	// expand() {
	// 	// Check preconditions.
	// 	if (this.power < 0)
	// 		throw new Error(`Cannot expand a power expression with power smaller than zero. The power is "${this.power}".`)
	// 	if (!(this.base instanceof Sum))
	// 		return this // No need to expand.
	// 	if (this.base.terms > 2)
	// 		throw new Error(`Expanding powers of sums with more than two terms is currently not supported.`)

	// 	// Walk through the powers.
	// 	const terms = []
	// 	for (let i = 0; i <= this.power; i++) {
	// 		terms.push(new Product([
	// 			new Power(this.base.terms[0], (this.power - i)),
	// 			new Power(this.base.terms[1], i),
	// 		], combination(this.power, i)))
	// 	}
	// 	return new Sum(terms, this.factor * (this.base.factor ** this.power)).simplify()
	// }
}
Power.defaultSO = Parent.getDefaultSO(args)
Power.args = args
module.exports = Power