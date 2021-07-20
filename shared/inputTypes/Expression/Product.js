const Expression = require('./abstracts/Expression')
const ExpressionList = require('./abstracts/ExpressionList')
const Constant = require('./Constant')
const Sum = require('./Sum')

const Parent = ExpressionList

class Product extends Parent {
	toString(ignoreFactor = false) {
		// Set up the string for the product.
		let result = this.terms.map(term => {
			if (term.requiresBracketsFor(Expression.bracketLevels.multiplication))
				return `(${term.str})`
			return term.str
		}).join('*')

		// Add the factor.
		if (!ignoreFactor)
			result = this.addFactorToString(result)

		return result
	}

	requiresBracketsFor(level, ignoreFactor = false) {
		return level === Expression.bracketLevels.division || level === Expression.bracketLevels.powers
	}

	getDerivativeBasic(variable) {
		// Apply the product rule.
		const terms = []
		this.terms.forEach((term, termIndex) => {
			if (term.dependsOn(variable)) {
				const termsCopy = [...this.terms] // Make a shallow clone of the product terms array.
				termsCopy[termIndex] = term.getDerivativeBasic(variable) // Replace the i'th term by its derivative.
				terms.push(new Product({ terms: termsCopy })) // And add this to the resulting sum.
			}
		})
		return new Sum(terms).multiplyBy(this.factor)
	}

	simplify(options = {}) {
		// Simplify all children.
		let factor = this.factor
		let terms = this.terms.map(term => term.simplify(options))

		// Check for structure simplifications.
		if (options.structure) {
			// Check simple cases.
			if (terms.length === 0)
				return new Constant(this.factor)
			if (terms.length === 1)
				return terms[0].multiplyBy(this.factor)
			if (this.factor === 1 && terms.length === 2 && terms[0] instanceof Constant && terms[1].factor === 1)
				return terms[1].multiplyBy(terms[0]) // Replace the product 3*x by a variable 3*x with factor 3.

			// Flatten products inside this product. If there is a product, replace it by its array of terms (if necessary preceded by its factor) and then flatten the result.
			terms = terms.map(term => {
				if (!(term instanceof Product))
					return term // Keep the term as is.
				if (term.factor === 1)
					return term.terms // Insert the terms of the sub-product.
				if (term.factor === -1 && term.terms[0].factor >= 0)
					return [term.terms[0].multiplyBy(-1), ...term.terms.slice(1)] // Multiply the first term by -1.
				return [new Constant(term.factor), ...term.terms] // Include the factor as extra term.
			}).flat() // Flatten the result to get an array of terms.
		}

		// Return the final result.
		return new Product({ factor, terms })
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