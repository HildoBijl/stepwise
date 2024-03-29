const { getRandomInteger, selectRandomly, getRandomIndices } = require('../../../../util')
const { asExpression, Integer, Fraction } = require('../../../../CAS')

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
	const indices = getRandomIndices(weights.length, num, true, weights)

	// Set up the respective elementary functions.
	return indices.map(index => {
		switch (index) {
			case 0: // c
				return asExpression(getRandomInteger(-12, 12, [0]))
			case 1: // x^n
				const powerAbove = selectRandomly(includeX ? [1, 2, 3, 4] : [2, 3, 4])
				return asExpression(powerAbove === 1 ? 'x' : `x^${powerAbove}`)
			case 2: // 1/x^n
				const powerBelow = selectRandomly([1, 2, 3, 4])
				return asExpression(powerBelow === 1 ? '1/x' : `1/x^${powerBelow}`)
			case 3: // sqrt(x)
				return asExpression(`sqrt(x)`)
			case 4: // root[n](x)
				return asExpression(`root[${selectRandomly([2, 3, 4])}](x)`)
			case 5: // sin(x)
				return asExpression(`sin(x)`)
			case 6: // cos(x)
				return asExpression(`cos(x)`)
			case 7: // e^x
				return asExpression(`e^x`)
			case 8: // g^x
				return asExpression(`${selectRandomly([2, 3, 5, 10])}^x`)
			case 9: // ln(x)
				return asExpression(`ln(x)`)
			case 10: // log[g](x)
				return asExpression(`log[${selectRandomly([2, 3, 5, 10])}](x)`)
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
	let constant = Integer.one

	// The function should not be a sum.
	if (func.isSubtype('Sum'))
		throw new Error(`Invalid case: cannot process sums. Only a single term is expected.`)

	// For integers, just return them right away.
	if (func.isSubtype('Integer'))
		return { constant: Integer.one, func }

	// For products, pull out the constant.
	if (func.isSubtype('Product')) {
		if (func.terms.length > 2)
			throw new Error(`Invalid case: cannot process products with more than two terms.`)
		const constantTerm = func.terms.find(factor => factor.isNumeric())
		const nonConstantTerm = func.terms.find(factor => !factor.isNumeric())
		if (!constantTerm || !nonConstantTerm)
			throw new Error(`Invalid case: cannot process products not consisting of a constant times a non-constant term.`)
		constant = constant.multiply(constantTerm)
		func = nonConstantTerm
	}

	// For fractions, pull out the constant too.
	if (func.isSubtype('Fraction')) {
		if (!func.numerator.isNumeric())
			throw new Error(`Invalid case: cannot process fractions with a non-constant numerator.`)
		constant = constant.multiply(func.numerator)
		func = new Fraction(Integer.one, func.denominator)
	}

	// Constants have been pulled out. The result should be an elementary function. (Or the input was faulty, but it's too much of a hassle to check.)
	return {
		func,
		constant: constant.basicClean(),
	}
}
module.exports.getElementaryFunctionFromTerm = getElementaryFunctionFromTerm
