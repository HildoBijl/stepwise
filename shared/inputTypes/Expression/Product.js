const ExpressionList = require('./ExpressionList')
const Constant = require('./Constant')
const Sum = require('./Sum')
// const Variable = require('./Variable')
const Parent = ExpressionList

class Product extends Parent {
	toString(ignoreFactor = false) {
		// Set up the string for the product.
		let result = this.terms.map(term => term.str).join('*')

		// Add brackets if necessary.
		let addBrackets = false
		if (addBrackets)
			result = `(${result})`

		// Add the factor.
		if (!ignoreFactor)
			result = this.addFactorToString(result)

		return result
	}

	getDerivative(variable) {
		variable = this.verifyVariable(variable)

		// Apply the product rule.
		const sumTerms = []
		this.terms.forEach((term, termIndex) => {
			const termsCopy = this.terms.map(term => term.clone()) // Make a full copy (clone) of the terms array.
			termsCopy[termIndex] = term.getDerivative(variable) // Replace the i'th term by its derivative.
			if (!termsCopy[termIndex].equals(new Constant(0))) // If the derivative is not zero ...
				sumTerms.push(new Product({ terms: termsCopy })) // ... then add this to the resulting sum. Also keep the factor.
		})
		return new Sum({ factor: this.factor, terms: sumTerms }).simplify()
	}

	simplify() {
		return this // ToDo later: add this.
	}

	// // hasDenominator checks if the product has terms with a negative power.
	// hasDenominator() {
	// 	return this.terms.some(term => (term instanceof Power && term.power < 0))
	// }

	// simplify() {
	// 	// console.log('Starting product simplification: ' + this.toString())
	// 	// First simplify the individual terms.
	// 	const terms = this.terms.map(term => term.simplify())

	// 	// The goal now is to walk through all the terms, collecting identical terms and keeping track of their powers. First, let's set up some storage.
	// 	let factor = this.factor
	// 	const foundTerms = [] // This will collect all the terms that we will find. So in "3*x^2*(4*x*y^2)*z" it will collect "x", "y" and "z".
	// 	const powers = [] // This will keep track of the corresponding powers. So in "3*x^2*(4*x*y^2)*z" it will eventually contain [3,2,1].

	// 	// When we want to add a term to the above arrays, we will use this function.
	// 	const addTerm = (term, power = 1) => {
	// 		const index = foundTerms.findIndex(term2 => term.equals(term2, true))
	// 		if (index === -1) {
	// 			const termToAdd = term.clone()
	// 			termToAdd.factor = 1
	// 			foundTerms.push(termToAdd)
	// 			powers.push(power)
	// 		} else {
	// 			powers[index] += power
	// 		}
	// 	}

	// 	// When we encounter a term in our product, we use this function to check it.
	// 	const processTerm = (term) => {
	// 		factor *= term.factor
	// 		switch (term.constructor) {
	// 			case Constant:
	// 				return

	// 			case Parameter:
	// 			case Sum:
	// 				return addTerm(term)


	// 			case Product: // When we find a product, walk through the terms and add them.
	// 				return term.terms.forEach(processTerm)

	// 			case Power:
	// 				return addTerm(term.base, term.power)

	// 			default:
	// 				if (term instanceof FunctionExpression)
	// 					return addTerm(term)
	// 				throw new TypeError(`Product simplify error: the Product expression does not support expressions of type "${term.getType()}" yet.`)
	// 		}
	// 	}

	// 	// Alright, time to iterate! This is where the magic happens.
	// 	terms.forEach(processTerm)

	// 	// We have enough data to set up the result. Gather all the collected terms into a terms array.
	// 	const newTerms = []
	// 	foundTerms.forEach((term, index) => {
	// 		// Ignore powers of 0. This becomes 1 anyway.
	// 		if (powers[index] === 0)
	// 			return

	// 		// Upon a power of 1, just add the term.
	// 		if (powers[index] === 1) {
	// 			newTerms.push(term)
	// 			return
	// 		}

	// 		// Upone a higher power, turn it into a Power expression.
	// 		newTerms.push(new Power(term, powers[index]))
	// 	})

	// 	// Do some boundary case checks.
	// 	if (factor === 0)
	// 		return new Constant(0)
	// 	if (newTerms.length === 0)
	// 		return new Constant(factor)
	// 	if (newTerms.length === 1)
	// 		return newTerms[0].multiplyBy(factor)

	// 	// The next step is to sort the terms in the array. 
	// 	const productSort = (term1, term2) => {
	// 		// Check the number of functions in the terms.
	// 		const numFunctionsDiff = term1.getNumFunctions() - term2.getNumFunctions()
	// 		if (numFunctionsDiff !== 0)
	// 			return numFunctionsDiff

	// 		// Check the polynomial degree of the terms.
	// 		const polynomialDegreeDiff = term1.getPolynomialDegree() - term2.getPolynomialDegree()
	// 		if (polynomialDegreeDiff !== 0)
	// 			return -polynomialDegreeDiff // Minus sign to get higher degrees first.

	// 		// The rest doesn't really matter.
	// 		return 0
	// 	}
	// 	newTerms.sort(productSort)

	// 	// Everything in order! Return the simplified product.
	// 	// console.log('Result of Product simplification: ' + new Product(newTerms, factor).toString())
	// 	return new Product(newTerms, factor)
	// }

	// // expand expands the brackets inside the multiplication. Afterwards, a simplify is also automatically called.
	// expand() {
	// 	// Check if there is a denominator. It cannot be expanded then.
	// 	if (this.hasDenominator())
	// 		throw new Error(`Cannot expand a product with a denominator.`)

	// 	// Walk through the terms and, if there is a sum, expand the multiplication brackets.
	// 	let newTerms = [new Constant(1)]
	// 	this.terms.forEach(term => {
	// 		term = (term instanceof Power ? term.expand() : term) // If this is a power, expand that power into a sum first.
	// 		let termsToIncorporate = (term instanceof Sum ? term.terms : [term]) // If we don't have a sum but a single multiplying term, just make an array of that element for easy processing.
	// 		const oldTerms = newTerms // Switch array references.
	// 		newTerms = []
	// 		oldTerms.forEach(oldTerm => {
	// 			termsToIncorporate.forEach(termToIncorporate => {
	// 				newTerms.push(new Product([oldTerm, termToIncorporate], term.factor))
	// 			})
	// 		})
	// 	})
	// 	return new Sum(newTerms, this.factor).simplify()
	// }
}
Product.defaultSO = Parent.defaultSO
module.exports = Product