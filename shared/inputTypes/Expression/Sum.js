const { sum, count } = require('../../util/arrays')
const { processOptions } = require('../../util/objects')

const Expression = require('./abstracts/Expression')
const ExpressionList = require('./abstracts/ExpressionList')
const Constant = require('./abstracts/Constant')
const Integer = require('./Integer')
const Variable = require('./Variable')

const Parent = ExpressionList

class Sum extends Parent {
	toString() {
		let result = ''
		this.terms.forEach((term, index) => {
			// Add a plus when necessary.
			if (index > 0 && term.requiresPlusInSum())
				result += '+'

			// Add brackets when necessary.
			const addBrackets = term.requiresBracketsFor(Expression.bracketLevels.addition)
			result += addBrackets ? `(${term.str})` : term.str
		})
		return result
	}

	toTex() {
		let result = ''
		this.terms.forEach((term, index) => {
			// Add a plus when necessary.
			if (index > 0 && term.requiresPlusInSum())
				result += '+'

			// Add brackets when necessary.
			const addBrackets = term.requiresBracketsFor(Expression.bracketLevels.addition)
			result += addBrackets ? `(${term.tex})` : term.tex
		})
		return result
	}

	requiresBracketsFor(level) {
		return level !== Expression.bracketLevels.addition // Always add brackets, except in an addition.
	}

	toNumber() {
		return sum(this.terms.map(term => term.toNumber()))
	}

	getDerivativeBasic(variable) {
		// Apply the derivative to each element individually.
		return new Sum(this.terms.map(term => term.getDerivativeBasic(variable)))
	}

	simplifyBasic(options = {}) {
		let { terms } = this.simplifyChildren(options)

		// Filter out zero elements.
		if (options.removeUseless) {
			terms = terms.filter(term => !term.equals(Integer.zero))
		}

		// Merge all numbers together and put them at the start.
		if (options.mergeNumbers) {
			let number = 0
			terms = terms.filter(term => {
				if (term instanceof Constant) {
					number += term.number
					return false
				}
				return true
			})
			if (number !== 0)
				terms.unshift(Constant.toNumber(number))
		}

		// Check for structure simplifications.
		if (options.structure) {
			// Check simple cases.
			if (terms.length === 0)
				return Constant.zero
			if (terms.length === 1)
				return terms[0]

			// Flatten sums inside this sum.
			terms = terms.map(term => term.isType(Sum) ? term.terms : term).flat()
		}

		// ToDo: Merge equal terms (except for a constant) together.
		// ToDo: Figure out what to do with 2*x + pi*x. Merge it to (2 + pi) or keep it separate?

		// Sort terms.
		terms = terms.sort(Sum.order)

		// Return the final result.
		return new Sum(terms)
	}

	// order determines the sorting orders. It takes two terms and returns a value larger than 0 if b must be before a.
	static order(a, b) {
		// Define a series of tests. If one of them matches for an element and not for the other, the first element comes first.
		const Product = require('./Product')
		const tests = [
			x => x instanceof Constant,
			x => x.isNumeric(),
			x => x.isType(Variable),
			x => x.isType(Product),
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
			case 3: // Product.
				// ToDo: turn this into something sensible.
				// Perhaps check if it has a function. If so, move it later on. If not, use a default polynomial ordering set-up.
				return a.terms.length - b.terms.length // Fewer terms first. 
			case 4: // Remaining.
				return 0 // Doesn't matter for now.
		}
	}
}
Sum.defaultSO = Parent.defaultSO
Sum.type = 'Sum'
module.exports = Sum