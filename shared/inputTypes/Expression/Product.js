const { product, count } = require('../../util/arrays')

const Expression = require('./abstracts/Expression')
const ExpressionList = require('./abstracts/ExpressionList')
const Constant = require('./abstracts/Constant')
const Integer = require('./Integer')
const Variable = require('./Variable')
const Sum = require('./Sum')

const Parent = ExpressionList

class Product extends Parent {
	toString() {
		const termToString = (term, index) => {
			const precursor = preceedByTimes(term, index) ? '*' : ''
			if (term.requiresBracketsFor(Expression.bracketLevels.multiplication))
				return `${precursor}(${term.str})`
			return `${precursor}${term.str}`
		}

		// If the product starts with "-1" then just add a minus instead of "-1*".
		if (this.terms.length > 1 && this.terms[0].equalsBasic(Integer.minusOne) && !(this.terms[1] instanceof Constant))
			return '-' + this.terms.slice(1).map(termToString).join('')
		return this.terms.map(termToString).join('')
	}

	toTex() {
		const termToTex = (term, index) => {
			const precursor = preceedByTimes(term, index) ? ' \\cdot ' : ''
			if (term.requiresBracketsFor(Expression.bracketLevels.multiplication))
				return `${precursor}\\left(${term.tex}\\right)`
			return `${precursor}${term.tex}`
		}

		// If the product starts with "-1" then just add a minus instead of "-1*".
		if (this.terms.length > 1 && this.terms[0].equalsBasic(Integer.minusOne) && !(this.terms[1] instanceof Constant))
			return '-' + this.terms.slice(1).map(termToTex).join('')
		return this.terms.map(termToTex).join('')
	}

	requiresBracketsFor(level) {
		return level === Expression.bracketLevels.division || level === Expression.bracketLevels.powers
	}

	requiresPlusInSum() {
		return this.terms[0].requiresPlusInSum()
	}

	toNumber() {
		return product(this.terms.map(term => term.toNumber()))
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
		return new Sum(terms)
	}

	simplifyBasic(options = {}) {
		// Simplify all children with the same options.
		let { terms } = this.simplifyChildren(options)

		// Flatten products inside this product.
		if (options.structure) {
			terms = terms.map(term => term.isType(Product) ? term.terms : term).flat()
		}

		// Merge all numbers together and put them at the start.
		if (options.mergeNumbers) {
			let number = 1
			terms = terms.filter(term => {
				if (term instanceof Constant) {
					number *= term.number
					return false
				}
				return true
			})
			if (number !== 1)
				terms.unshift(Constant.toNumber(number))
		}

		// Check for useless elements.
		if (options.removeUseless) {
			// If there is a zero multiplication, return zero.
			if (terms.some(term => term.equalsBasic(Integer.zero)))
				return Integer.zero

			// Filter out one elements.
			terms = terms.filter(term => !term.equalsBasic(Integer.one))

			// Filter out minus one elements. If there's an odd number, check if the first factor is a constant. If so, make it negative. Otherwise add a -1 at the start.
			const isMinusOne = term => term.equalsBasic(Integer.minusOne)
			const minusOneCount = count(terms, isMinusOne)
			if (minusOneCount > 0)
				terms = terms.filter(term => !isMinusOne(term))
			if (minusOneCount % 2 === 1) {
				if (terms[0] instanceof Constant) {
					terms[0] = terms[0].applyMinus()
				} else {
					terms.unshift(Integer.minusOne)
				}
			}
		}

		// Check for structure simplifications.
		if (options.structure) {
			// Check basic cases.
			if (terms.length === 0)
				return Integer.one
			if (terms.length === 1)
				return terms[0]
		}

		// Expand brackets. For this, find the first sum and expand it. Other sums will be expanded recursively through further simplify calls.
		if (options.expandBrackets) {
			const sumIndex = terms.findIndex(term => term.isType(Sum))
			if (sumIndex !== -1) {
				return new Sum(terms[sumIndex].terms.map(sumTerm => new Product([
					...terms.slice(0, sumIndex),
					sumTerm,
					...terms.slice(sumIndex + 1),
				]))).simplifyBasic(options)
			}
		}

		// ToDo: merge equal terms into powers.

		// Sort terms.
		if (options.sortTerms)
			terms = terms.sort(Product.order)

		// Return the final result.
		return new Product(terms)
	}

	// order determines the sorting order. It takes two terms and returns a value larger than 0 if b must be before a.
	static order(a, b) {
		// Define a series of tests. If one of them matches for an element and not for the other, the first element comes first.
		const tests = [
			x => x instanceof Constant,
			x => x.isNumeric(),
			x => x.isType(Variable),
			x => x.isType(Sum),
			x => true, // Remaining cases.
		]

		// Find the first occurrence of a positive test.
		const type = tests.findIndex(test => (test(a) || test(b)))

		// Check if both parameters satisfy the test. If not, put the matching element first.
		const test = tests[type]
		if (!test(a))
			return 1
		if (!test(b))
			return -1

		// If both elements fall in the same case, deal with this case separately.
		switch (type) {
			case 0: // Constants.
				return a.number - b.number // Smaller first.
			case 1: // Numeric, but not constants.
			case 2: // Variables.
				return Variable.order(a, b) // Apply default variable ordering.
			case 3: // Sum.
				return a.terms.length - b.terms.length // Fewer terms first.
			case 4: // Remaining.
				return 0 // Doesn't matter for now.
		}
	}
}
Product.defaultSO = Parent.defaultSO
Product.type = 'Product'
module.exports = Product

// preceedByTimes checks if the given term requires a times symbol prior to it when displaying it. It returns true or false.
function preceedByTimes(term, index) {
	return index > 0 && ((term instanceof Constant) || (term instanceof Product && term.terms[0] instanceof Constant))
}