// This file contains equality checks for expressions. There are placed here, instead of inside the objects, to prevent classes from getting too many methods that always have to be loaded in. On top of that, most equals methods rely on first simplifying expressions to some standard form and then comparing these reductions.

const { Integer } = require('./Expression')
const { compareNumbers } = require('../../../util/numbers')

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
// equalNumber compares two expressions to check if they're both numbers that are equal.
function equalNumber(input, correct) {
	return input.isNumeric() && correct.isNumeric() && compareNumbers(input.number, correct.number)
}

module.exports = {
	exactEqual,
	onlyOrderChanges,
	equalNumber,
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
	const check = (comparison) => comparison.isSubtype(Integer)
	return check(comparison1) || check(comparison2)

	// ToDo: put this back later on, when the CAS is complete.
	const comparison = input.divideBy(correct).cleanForAnalysis()
	return comparison.isSubtype(Integer)
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
