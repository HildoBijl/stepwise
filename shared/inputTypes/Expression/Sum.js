const { sum, count } = require('../../util/arrays')
const { processOptions } = require('../../util/objects')

const Expression = require('./abstracts/Expression')
const ExpressionList = require('./abstracts/ExpressionList')
const Constant = require('./Constant')

const Parent = ExpressionList

class Sum extends Parent {
	toString() {
		// Set up the string for the sum. Only add a plus if there was no minus already from the factor.
		let result = ''
		this.terms.forEach((term, index) => {
			if (index > 0 && term.factor >= 0)
				result += '+'
			const addBrackets = term.requiresBracketsFor(Expression.bracketLevels.addition)
			result += addBrackets ? `(${term.str})` : term.str
		})

		// Add the factor.
		return this.addFactorToString(result, true)
	}

	toTex() {
		// Set up the string for the sum. Only add a plus if there was no minus already from the factor.
		let result = ''
		this.terms.forEach((term, index) => {
			if (index > 0 && term.factor >= 0)
				result += '+'
			const addBrackets = term.requiresBracketsFor(Expression.bracketLevels.addition)
			result += addBrackets ? `(${term.tex})` : term.tex
		})

		// Add the factor.
		result = this.addFactorToTex(result, true)
		return result
	}

	requiresBracketsFor(level) {
		if (level === Expression.bracketLevels.addition)
			return false
		if (level === Expression.bracketLevels.multiplication)
			return this.factor === 1 // In this case no brackets have been added yet.
		return true
	}

	toNumber() {
		return this.factor * sum(this.terms.map(term => term.toNumber()))
	}

	getDerivativeBasic(variable) {
		// Apply the derivative to each element individually.
		return new Sum(this.terms.map(term => term.getDerivativeBasic(variable))).multiplyBy(this.factor)
	}

	simplifyBasic(options = {}) {
		let { factor, terms } = this.simplifyChildren(options)

		// Check for useless elements.
		if (options.removeUseless) {
			// If the factor is 0, turn this term into zero.
			if (factor === 0)
				return Constant.zero

			// Filter out zero elements.
			terms = terms.filter(term => !term.equals(Constant.zero))
		}

		// Check for factor reductions.
		if (options.reduceFactors) {
			// Apply the factor of the sum to each term in the sum.
			if (factor !== 1) {
				terms = terms.map(term => term.multiplyBy(factor))
				factor = 1
			}

			// If there are at least two constants, merge them together.
			if (count(terms, term => term.isType(Constant)) >= 2) {
				let constant = 0
				terms = terms.filter(term => {
					if (term.isType(Constant)) {
						constant += term.factor // Add the number.
						return false // Remove it.
					}
					return true // Keep it.
				})
				if (constant !== 0)
					terms.unshift(new Constant(constant))
			}
		}

		// Check for structure simplifications.
		if (options.structure) {
			// Check simple cases.
			if (terms.length === 0)
				return Constant.zero
			if (terms.length === 1) {
				if (factor === 1 || terms[0].factor === 1)
					return terms[0].multiplyBy(factor)
				return new Product({ factor, terms }).simplify(options) // Turn it into a single-element product. This is easier to deal with than a single-element Sum.
			}

			// Flatten sums inside this sum. If there is a sum with a factor of 1, replace it by its array of terms.
			terms = terms.map(term => {
				if (!(term instanceof Sum))
					return term // Not a sum. Keep the term as is.
				if (term.factor !== 1)
					return term // There is a factor. Keep the term as is.
				return term.terms
			}).flat() // Flatten the result to get an array of terms.
		}

		// ToDo: sort terms.

		// Return the final result.
		return new Sum({ factor, terms })
	}

	// ToDo later: add simplify functions.
	// simplify() {
	// 	// console.log('Starting sum simplification: ' + this.toString())
	// 	// First simplify the individual terms.
	// 	const result = new Sum(this.terms.map(term => term.simplify()), this.factor)

	// 	// First we check if this is a sum of fractions that can be merged into a product. For example, if we have 1/(x+1) - x/(x+1)^2, then this can be written much simpler. We try to detect that here.
	// 	const simplifiedSumOfFractions = result.simplifySumOfFractions()
	// 	if (simplifiedSumOfFractions) // Check if this actually resulted in something. If so, return it.
	// 		return simplifiedSumOfFractions

	// 	// The goal now is to walk through all the terms, collecting identical terms and keeping track of their factors. First, let's set up some storage.
	// 	let newTerms = [] // This will collect all the terms that we will find. So in "3*x^2 + y + 2*x^2 + 4*x" it will collect "3*x^2" (later "5*x^2"), "y" and "x".

	// 	// When we want to add a term to the above arrays, we will use this function.
	// 	const addTerm = (term) => {
	// 		const index = newTerms.findIndex(term2 => term.equals(term2, true))
	// 		if (index === -1)
	// 			newTerms.push(term.clone())
	// 		else
	// 			newTerms[index].factor += term.factor
	// 	}

	// 	// When we encounter a term in our product, we use this function to check it.
	// 	const processTerm = (term) => {
	// 		switch (term.constructor) {
	// 			case Constant:
	// 			case Parameter:
	// 			case Product:
	// 			case Power:
	// 				addTerm(term)
	// 				return

	// 			case Sum: // When we find a sum, walk through the terms and add them.
	// 				term.terms.forEach(subTerm => processTerm(subTerm.multiplyBy(term.factor)))
	// 				return

	// 			default:
	// 				throw new TypeError(`Sum simplify error: the Sum expression does not support expressions of type "${term.getType()}" yet.`)
	// 		}
	// 	}

	// 	// Alright, time to iterate! This is where the magic happens.
	// 	result.terms.forEach(processTerm) // Fill up the newTerms array.
	// 	newTerms = newTerms.filter(term => term.factor !== 0) // Filter out terms with a zero factor.
	// 	newTerms = newTerms.map(term => term.multiplyBy(this.factor)) // Get rid of the factor of this sum: walk through all terms and multiply them by this factor, so we don't have to add the factor later.

	// 	// Do some boundary case checks.
	// 	if (newTerms.length === 0)
	// 		return new Constant(0) // Everything drops out.
	// 	if (newTerms.length === 1)
	// 		return newTerms[0] // Only one term left; return that.

	// 	// The next step is to sort the terms in the array.
	// 	const sumSort = (term1, term2) => {
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
	// 	newTerms.sort(sumSort)

	// 	// Next, make sure that the first term has a factor of one, and scale everything else accordingly.
	// 	let factor = 1
	// 	if (newTerms[0].factor !== 1) {
	// 		factor = newTerms[0].factor
	// 		const multiplication = 1 / factor
	// 		newTerms = newTerms.map(term => term.multiplyBy(multiplication))
	// 	}

	// 	// Everything in order! Return the simplified product.
	// 	// console.log('Result of Sum simplification: ' + new Sum(newTerms).toString())
	// 	return new Sum(newTerms, factor)
	// }

	// // simplifySumOfFractions checks if this is a sum of fractions that can be better pulled together into a product. If so, it returns the corresponding product.
	// // What it does is the following. For a sum like x/(2*(x+1)) - 1/(x+1)^2 + 1/(x+2) it first gathers the highest-power denominators of every term. So it gathers (x+1)^(-2) and (x+2)^(-1). (Factors are omitted.) Then it walks through all the terms and turns them into terms with this denominator. So the first term becomes ((1/2)*x*(x+2)*(x+1)) / ((x+1)^2*(x+2)). The numerator of this is stored for every term and subsequently added up. Then it's multiplied (divided) by the denominator, resulting in the final outcome.
	// simplifySumOfFractions() {
	// 	// First we walk through all the terms to collect denominators.
	// 	const denominatorTerms = []
	// 	const processTerm = term => { // This function will be used to process denominator terms.
	// 		if (term instanceof Product) // If we find a product, like x*(x+1)/(x+2)/(x+3)^2, then consider the individual subterms.
	// 			return term.terms.forEach(processTerm)
	// 		if (!(term instanceof Power)) // If we find something other than a power, it's not in the denominator. 
	// 			return
	// 		if (term.power >= 0) // If the power is not negative, the term is not in the denominator.
	// 			return
	// 		const index = denominatorTerms.findIndex(denominatorTerm => denominatorTerm.base.equals(term.base, true)) // Check if the exponent base equals a term we've already encountered.
	// 		if (index === -1) // If the term is new, add it to the denominator.
	// 			denominatorTerms.push(new Power(term.base.clone().eliminateFactor(), term.power))
	// 		else
	// 			denominatorTerms[index].power = Math.min(denominatorTerms[index].power, term.power) // Find the lowest (most negative) power and store that.
	// 	}
	// 	this.terms.forEach(processTerm)

	// 	// If there are no denominators, don't do anything.
	// 	if (denominatorTerms.length === 0)
	// 		return

	// 	// Next, set up the numerator.
	// 	const numeratorTerms = []
	// 	this.terms.forEach(term => {
	// 		// Extract an array of all terms that need to be incorporated.
	// 		let currentProductTerms
	// 		if (term instanceof Constant || term instanceof Parameter || term instanceof Power)
	// 			currentProductTerms = [term]
	// 		else if (term instanceof Product)
	// 			currentProductTerms = term.terms
	// 		else
	// 			throw new Error(`Sum simplifying error: tried to simplify a sum with a term of type "${term.getType()}". This is not supported (yet).`)

	// 		// Set up the array of new product terms.
	// 		const newProductTerms = []
	// 		const denominatorTermsUsed = denominatorTerms.map(_ => false)
	// 		currentProductTerms.forEach(productTerm => {
	// 			// If this is not in the denominator, just add it to the resulting product.
	// 			if (!(productTerm.type instanceof Power) || productTerm.power >= 0)
	// 				return newProductTerms.push(productTerm)

	// 			// Find the corresponding term in the denominators and compare the power.
	// 			const index = denominatorTerms.findIndex(denominatorTerm => denominatorTerm.base.equals(productTerm.base, true))
	// 			const powerDifference = productTerm.power - denominatorTerms[index].power
	// 			if (powerDifference > 0) // If there should be a term in the denominator x^-5 and this term has x^-3 (or something like that) then add x^2 to the numerator.
	// 				newProductTerms.push(new Power(denominatorTerms[index].base.clone(), powerDifference, productTerm.factor * (productTerm.base.factor ** productTerm.power)).simplify()) // Take into account factors too.
	// 			denominatorTermsUsed[index] = true // Note that this denominator is taken care of.
	// 		})
	// 		denominatorTerms.forEach((denominator, index) => {
	// 			if (!denominatorTermsUsed[index])
	// 				newProductTerms.push(new Power(denominator.base, -denominator.power)) // If there is a term x^-5, and so the denominator has x^5, then we should add x^5 for the numerator if this term does not have that denominator term.
	// 		})

	// 		// Determine the new term for the numerator.
	// 		let newNumeratorTerm
	// 		if (newProductTerms.length === 0)
	// 			newNumeratorTerm = new Constant(1)
	// 		else if (newProductTerms.length === 1)
	// 			newNumeratorTerm = newProductTerms[0]
	// 		else
	// 			newNumeratorTerm = new Product(newProductTerms, term.factor).simplify()
	// 		if (newNumeratorTerm instanceof Product)
	// 			newNumeratorTerm = newNumeratorTerm.expand() // Products should be expanded, so we can see if terms cancel out.
	// 		numeratorTerms.push(newNumeratorTerm)
	// 	})
	// 	const numerator = new Sum(numeratorTerms).simplify()

	// 	// Now that we have the numerator, we just have to merge it together with the denominator.
	// 	const productTerms = [numerator]
	// 	denominatorTerms.forEach(denominatorTerm => productTerms.push(denominatorTerm))
	// 	return new Product(productTerms).simplify()
	// }
}
Sum.defaultSO = Parent.defaultSO
module.exports = Sum