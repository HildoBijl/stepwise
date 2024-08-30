// This file contains equality checks for expressions. There are placed here, instead of inside the objects, to prevent classes from getting too many methods that always have to be loaded in. On top of that, most equals methods rely on first simplifying expressions to some standard form and then comparing these reductions.

const { isNumber, compareNumbers } = require('../../../util')

const { Integer, ensureExpression } = require('./Expression')

/*
 * Basic Expression equality checks.
 */

// exactEqual compares two expressions for complete equality. "2x" and "x2" are different.
function exactEqual(input, correct) {
	input = ensureExpression(input)
	correct = ensureExpression(correct)
	return correct.equals(input, false)
}
// onlyOrderChanges compares two expressions for equality where order changes in sums/products are allowed. "2*3" and "3*2" are equal, but they are both different from "6". It also automatically includes an elementary clean, so that 2*(3/4) and (2*3)/4 are considered equal.
function onlyOrderChanges(input, correct) {
	input = ensureExpression(input)
	correct = ensureExpression(correct)
	return correct.elementaryClean().equals(input.elementaryClean(), true)
}
// equalNumber compares two expressions to check if they're both numbers that are equal.
function equalNumber(input, correct) {
	input = ensureExpression(input)
	correct = ensureExpression(correct)

	// Check for non-numeric cases.
	if (!isNumber(input) && !input.isNumeric())
		return false
	if (!isNumber(correct) && !correct.isNumeric())
		return false

	// Extract and compare numbers.
	const inputNumber = isNumber(input) ? input : input.number
	const correctNumber = isNumber(correct) ? correct : correct.number
	return compareNumbers(inputNumber, correctNumber)
}

module.exports = {
	exactEqual,
	onlyOrderChanges,
	equalNumber,
}

/*
 * More complex Expression equality checks.
 */

// equivalent checks if two expressions f and g are equivalent. It finds f-g, simplifies it and checks if this reduces to zero.
function equivalent(input, correct) {
	input = ensureExpression(input)
	correct = ensureExpression(correct)
	const comparison = correct.subtract(input).cleanForAnalysis()
	return Integer.zero.equalsBasic(comparison)
}

// integerMultiple checks if the first argument (input) is a non-zero integer multiple of the second argument (correct). It does this by finding input/correct, simplifying it and checking if it reduces to an integer.
function integerMultiple(input, correct) {
	input = ensureExpression(input)
	correct = ensureExpression(correct)

	// Manually check for minus signs.
	const comparison1 = input.divide(correct).cleanForAnalysis()
	const comparison2 = input.applyMinus().divide(correct).cleanForAnalysis()
	const check = (comparison) => comparison.isSubtype(Integer) && !Integer.zero.equalsBasic(comparison)
	return check(comparison1) || check(comparison2)

	// ToDo: put this back later on, when the CAS is complete.
// 	const comparison = input.divide(correct).cleanForAnalysis()
// 	return comparison.isSubtype(Integer)
}

// constantMultiple checks if the two arguments only differ by a non-zero constant ratio, like (2/3) or (pi^2/e). We divide input/correct and check if the simplification reduces to a non-zero numeric value. (If it's zero, then a zero input would be equal to everything, which would not be desirable.)
function constantMultiple(input, correct) {
	input = ensureExpression(input)
	correct = ensureExpression(correct)

	// ToDo: remove this check, when the CAS is complete. (It currently detects a few edge cases which the check below does not detect.)
	if (equivalent(input, correct) || equivalent(input.applyMinus(), correct))
		return true

	// Manually check for minus signs.
	const comparison1 = input.divide(correct).cleanForAnalysis()
	const comparison2 = input.applyMinus().divide(correct).cleanForAnalysis()
	const check = (comparison) => comparison.isNumeric() && !Integer.zero.equalsBasic(comparison)
	return check(comparison1) || check(comparison2)

	// ToDo: put this back later on, when the CAS is complete.
	// const comparison = input.divide(correct).cleanForAnalysis()
	// return comparison.isNumeric() && !Integer.zero.equalsBasic(comparison)
}

module.exports = {
	...module.exports,
	equivalent,
	integerMultiple,
	constantMultiple,
}
