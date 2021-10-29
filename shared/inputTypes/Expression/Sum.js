import { sum, count } from '../../util/arrays'
import { processOptions } from '../../util/objects'

import Expression from './abstracts/Expression'
import ExpressionList from './abstracts/ExpressionList'
import Constant from './abstracts/Constant'
import Integer from './Integer'
import Variable from './Variable'
import Product from './Product'

const Parent = ExpressionList

export default class Sum extends Parent {
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
			result += addBrackets ? `\\left(${term.tex}\\right)` : term.tex
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

		// Flatten sums inside this sum.
		if (options.structure) {
			terms = terms.map(term => term.isType(Sum) ? term.terms : term).flat()
		}

		// Filter out zero elements.
		if (options.removeUseless) {
			terms = terms.filter(term => !term.equalsBasic(Integer.zero))
		}

		// If there are at least two constants, merge them together and put them at the start.
		if (options.mergeNumbers) {
			const isConstant = term => term instanceof Constant
			if (count(terms, isConstant) > 1) {
				let number = 0
				terms = terms.filter(term => {
					if (isConstant(term)) {
						number += term.number
						return false
					}
					return true
				})
				if (number !== 0)
					terms.unshift(Constant.toNumber(number))
			}
		}

		// Find equal terms to cancel out. For this, walk through the terms, and try to match them with a negative counterpart. Upon finding a pair, skip both.
		if (options.applySumCancellations) {
			const skipped = terms.map(_ => false)
			terms = terms.filter((term1, index1) => {
				const index = terms.findIndex((term2, index2) => index1 < index2 && !skipped[index1] && !skipped[index2] && term1.equals(term2.applyMinus(), Expression.equalityLevels.onlyOrderChanges))
				if (index !== -1) {
					skipped[index1] = true
					skipped[index] = true
				}
				return !skipped[index1]
			})
		}

		// Check for structure simplifications.
		if (options.structure) {
			if (terms.length === 0)
				return Integer.zero
			if (terms.length === 1)
				return terms[0]
		}

		// ToDo: Merge equal terms (except for a constant) together.
		// ToDo: Figure out what to do with 2*x + pi*x. Merge it to (2 + pi) or keep it separate?

		// Sort terms.
		if (options.sortTerms)
			terms = terms.sort(Sum.order)

		// Return the final result.
		return new Sum(terms)
	}

	// order determines the sorting orders. It takes two terms and returns a value larger than 0 if b must be before a.
	static order(a, b) {
		// Define a series of tests. If one of them matches for an element and not for the other, the first element comes first.
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
