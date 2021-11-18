const { expressionEqualityLevels } = require('../../options')
const { Sum, Product, Fraction } = require('./Expression')

/*
 * Equality checks for expressions.
 */

const exactEqual = (correct, input) => correct.equals(input, expressionEqualityLevels.exact)
const onlyOrderChanges = (correct, input) => correct.equals(input, expressionEqualityLevels.onlyOrderChanges)
const equivalent = (correct, input) => correct.equals(input, expressionEqualityLevels.equivalent)
const integerMultiple = (correct, input) => correct.equals(input, expressionEqualityLevels.integerMultiple)
const constantMultiple = (correct, input) => correct.equals(input, expressionEqualityLevels.constantMultiple)

module.exports = {
	exactEqual,
	onlyOrderChanges,
	equivalent,
	integerMultiple,
	constantMultiple,
}

/*
 * Checks for properties of expressions. There are placed here, instead of inside the objects, to prevent classes from getting too many methods that always have to be loaded in.
 */

// hasFraction checks if there is a fraction inside this Expression. It also gives true if the Expression itself is a fraction, unless this is specifically set to be ignored (by passing false).
const hasFraction = (input, includeSelf = true) => input.recursiveSome(term => term.isType(Fraction), includeSelf)

// hasFractionWithinFraction checks if there are fractions inside this Expression that have further fractions inside them.
const hasFractionWithinFraction = (input) => input.recursiveSome(term => term.isType(Fraction) && hasFraction(term, false))

// hasSumWithinProduct checks if there are sums within products, like a*(b+c). It effectively checks whether brackets have been properly expanded.
const hasSumWithinProduct = (input) => input.recursiveSome(term => term.isType(Product) && term.recursiveSome(subTerm => subTerm.isType(Sum)))

// isPolynomial checks if this expression is a polynome.
const isPolynomial = (input) => {
	return input.recursiveEvery(term => {
		if (!(term instanceof Function))
			return true // Not a function. So a base type like a Constant, Variable, Sum or Product.
		if (term.isType(Fraction))
			return term.isNumeric() // A fraction. Is it a number, like 2/3 or so?
		if (term.isType(Power))
			return isPolynomial(term.base) && term.exponent.isType(Integer) && term.exponent.number >= 0 // A power. Does it have a polynomial base and a non-negative integer power?
		return false // Other type of function.
	})
}

// isRational checks if this expression is a rational expression: only polynome and fractions.
const isRational = (input) => {
	return input.recursiveEvery(term => {
		if (!(term instanceof Function))
			return true // Not a function. So a base type like a Constant, Variable, Sum or Product.
		if (term.isType(Fraction))
			return true // A fraction. This is always fine.
		if (term.isType(Power))
			return isPolynomial(term.base) && term.exponent.isType(Integer) // A power. Does it have a polynomial base and an integer power?
		return false // Other type of function.
	})
}

module.exports = {
	...module.exports,
	hasFraction,
	hasFractionWithinFraction,
	hasSumWithinProduct,
	isPolynomial,
	isRational,
}