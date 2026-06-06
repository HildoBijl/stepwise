const { randomInteger, sample, randomIndices } = require('@step-wise/utils')
const { asExpression, constants } = require('@step-wise/cas')

function getRandomElementaryFunctions(num = 1, includeConstant = false, includeDivision = true, includeX = true, includeRoots = true) {
	// Determine the indices of the elementary functions that we use.
	const weights = [3, 9, 5, 3, 1, 2, 2, 2, 1, 2, 1]
	if (!includeConstant)
		weights[0] = 0
	if (!includeDivision)
		weights[2] = 0
	if (!includeRoots) {
		weights[3] = 0
		weights[4] = 0
	}
	const indices = randomIndices(weights.length, num, true, weights)

	// Set up the respective elementary functions.
	return indices.map(index => {
		switch (index) {
			case 0: // c
				return asExpression(randomInteger(-12, 12, [0]))
			case 1: // x^n
				const powerAbove = sample(includeX ? [1, 2, 3, 4] : [2, 3, 4])
				return asExpression(powerAbove === 1 ? 'x' : `x^${powerAbove}`)
			case 2: // 1/x^n
				const powerBelow = sample([1, 2, 3, 4])
				return asExpression(powerBelow === 1 ? '1/x' : `1/x^${powerBelow}`)
			case 3: // sqrt(x)
				return asExpression(`sqrt(x)`)
			case 4: // root[n](x)
				return asExpression(`root[${sample([2, 3, 4])}](x)`)
			case 5: // sin(x)
				return asExpression(`sin(x)`)
			case 6: // cos(x)
				return asExpression(`cos(x)`)
			case 7: // e^x
				return asExpression(`e^x`)
			case 8: // g^x
				return asExpression(`${sample([2, 3, 5, 10])}^x`)
			case 9: // ln(x)
				return asExpression(`ln(x)`)
			case 10: // log[g](x)
				return asExpression(`log[${sample([2, 3, 5, 10])}](x)`)
			default:
				throw new Error(`Invalid elementary function case: cannot get an elementary function for index/case ${index}.`)
		}
	})
}
module.exports.getRandomElementaryFunctions = getRandomElementaryFunctions

function getRandomElementaryFunction(includeConstant) {
	return getRandomElementaryFunctions(1, includeConstant)[0]
}
module.exports.getRandomElementaryFunction = getRandomElementaryFunction

// getElementaryFunctionFromTerm takes a term consisting of a constant muliplication times an elementary function, like "-4/x", and extracts the elementary function and the constant.
function getElementaryFunctionFromTerm(func) {
	let constant = constants.one

	// For a minus, take the argument and apply the minus to the constant.
	if (func.isMinus()) {
		const result = getElementaryFunctionFromTerm(func.argument)
		return { func: result.func, constant: result.constant.negate() }
	}

	// The function should not be a sum.
	if (func.isSum())
		throw new Error(`Invalid case: cannot process sums. Only a single term is expected.`)

	// For integers, just return them right away.
	if (func.isInteger())
		return { constant: constants.one, func }

	// For products, pull out the constant.
	if (func.isProduct()) {
		if (func.factors.length > 2)
			throw new Error(`Invalid case: cannot process products with more than two terms.`)
		const constantTerm = func.factors.find(factor => factor.isNumeric())
		const nonConstantTerm = func.factors.find(factor => !factor.isNumeric())
		if (!constantTerm || !nonConstantTerm)
			throw new Error(`Invalid case: cannot process products not consisting of a constant times a non-constant term.`)
		constant = constant.multiply(constantTerm)
		func = nonConstantTerm
	}

	// For fractions, pull out the constant too.
	if (func.isFraction()) {
		if (!func.numerator.isNumeric())
			throw new Error(`Invalid case: cannot process fractions with a non-constant numerator.`)
		constant = constant.multiply(func.numerator)
		func = constants.one.divide(func.denominator)
	}

	// Constants have been pulled out. The result should be an elementary function. (Or the input was faulty, but it's too much of a hassle to check.)
	return {
		func,
		constant: constant.cancel(),
	}
}
module.exports.getElementaryFunctionFromTerm = getElementaryFunctionFromTerm
