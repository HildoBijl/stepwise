// This file contains equality checks for expressions. There are placed here, instead of inside the objects, to prevent classes from getting too many methods that always have to be loaded in. On top of that, most equals methods rely on first simplifying expressions to some standard form and then comparing these reductions.

const { Integer, Sum, Product, Fraction, Power } = require('./Expression')

/*
 * Basic Expression equality checks.
 */

// exactEqual compares two expressions for complete equality. "2x" and "x2" are different.
function exactEqual(input, correct) {
	return correct.equals(input, false)
}
// onlyOrderChanges compares two expressions for equality where order changes in sums/products are allowed. "2*3" and "3*2" are equal, but they are both different from "6".
function onlyOrderChanges(input, correct) {
	return correct.equals(input, true)
}

module.exports = {
	exactEqual,
	onlyOrderChanges,
}

/*
 * More complex Expression equality checks.
 */

// onlyElementaryClean checks if two expressions are equal after an elementary clean. It also allows order changes.
function onlyElementaryClean(input, correct) {
	return onlyOrderChanges(input.elementaryClean(), correct.elementaryClean())
}

// equivalent checks if two expressions f and g are equivalent. It finds f-g, simplifies it and checks if this reduces to zero.
function equivalent(input, correct) {
	const comparison = correct.subtract(input).cleanForAnalysis()
	return Integer.zero.equalsBasic(comparison)
}

// integerMultiple checks if the first argument (input) is an integer multiple of the second argument (correct). It does this by finding input/correct, simplifying it and checking if it reduces to an integer.
function integerMultiple(input, correct) {
	// Manually check for minus signs.
	const comparison1 = input.divideBy(correct).cleanForAnalysis()
	const comparison2 = input.applyMinus().divideBy(correct).cleanForAnalysis()
	const check = (comparison) => comparison.isType(Integer)
	return check(comparison1) || check(comparison2)

	// ToDo: put this back later on, when the CAS is complete.
	const comparison = input.divideBy(correct).cleanForAnalysis()
	return comparison.isType(Integer)
}

// constantMultiple checks if the two arguments only differ by a constant ratio, like (2/3) or (pi^2/e). We divide input/correct and check if the simplification reduces to a non-zero numeric value. (If it's zero, then a zero input would be equal to everything, which would not be desirable.)
function constantMultiple(input, correct) {
	// Manually check for minus signs.
	const comparison1 = input.divideBy(correct).cleanForAnalysis()
	const comparison2 = input.applyMinus().divideBy(correct).cleanForAnalysis()
	const check = (comparison) => comparison.isNumeric() && !Integer.zero.equalsBasic(comparison)
	return check(comparison1) || check(comparison2)

	// ToDo: put this back later on, when the CAS is complete.
	// const comparison = input.divideBy(correct).cleanForAnalysis()
	// return comparison.isNumeric() && !Integer.zero.equalsBasic(comparison)
}

module.exports = {
	...module.exports,
	onlyElementaryClean,
	equivalent,
	integerMultiple,
	constantMultiple,
}

/*
 * Checks for properties of expressions.
 */

// hasSumWithinProduct checks if there are sums within products, like a*(b+c). It effectively checks whether brackets have been properly expanded.
function hasSumWithinProduct(input) {
	return input.recursiveSome(term => term.isType(Product) && term.recursiveSome(subTerm => subTerm.isType(Sum)))
}

// hasSumWithinFraction checks if there is a sum within a fraction, like (a+b)/c.
function hasSumWithinFraction(input) {
	return input.recursiveSome(term => term.isType(Fraction) && term.recursiveSome(subTerm => subTerm.isType(Sum)))
}

// hasFraction checks if there is a fraction inside this Expression. It also gives true if the Expression itself is a fraction, unless this is specifically set to be ignored (by passing false).
function hasFraction(input, includeSelf = true) {
	return input.recursiveSome(term => term.isType(Fraction), includeSelf)
}

// hasFractionSatisfying checks if there is a fraction inside this Expression that also satisfies another given check.
function hasFractionSatisfying(input, check) {
	return input.recursiveSome(term => term.isType(Fraction) && check(term))
}

// hasFractionWithinFraction checks if there are fractions inside this Expression that have further fractions inside them.
function hasFractionWithinFraction(input) {
	return hasFractionSatisfying(input, fraction => hasFraction(fraction, false))
}

// hasPower checks if there is a power inside this Expression.
function hasPower(input, includeSelf = true) {
	return input.recursiveSome(term => term.isType(Power), includeSelf)
}

// isPolynomial checks if this expression is a polynome: only sums, products and powers with integer exponents. Fractions are only allowed when dividing by a numeric value, like x/2 or y/pi, but not when dividing by variables like y/x.
function isPolynomial(input) {
	return input.recursiveEvery(term => {
		if (!(term instanceof Function))
			return true // Not a function. So a base type like a Constant, Variable, Sum or Product.
		if (term.isType(Fraction))
			return term.denominator.isNumeric() // A fraction. Is the denominator a number?
		if (term.isType(Power))
			return isPolynomial(term.base) && term.exponent.isType(Integer) && term.exponent.number >= 0 // A power. Does it have a polynomial base and a non-negative integer power?
		return false // Other type of function.
	})
}

// is Rational checks if this expression is a rational expression: only polynomes and fractions.
function isRational(input) {
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
	hasSumWithinProduct,
	hasSumWithinFraction,
	hasFraction,
	hasFractionSatisfying,
	hasFractionWithinFraction,
	hasPower,
	isPolynomial,
	isRational,
}