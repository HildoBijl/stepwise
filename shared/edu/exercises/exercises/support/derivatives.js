const { getRandomInteger, selectRandomly, getRandomIndices } = require('../../../../util/random')
const { asExpression } = require('../../../../CAS')

function getRandomElementaryFunctions(num = 1, includeConstant = false) {
	// Determine the indices of the elementary functions that we use.
	const weights = [3, 2, 1, 1, 1, 1, 1, 1, 1, 1]
	if (includeConstant)
		weights.push(1)
	const indices = getRandomIndices(weights.length, num, false, weights)

	// Set up the respective elementary functions.
	return indices.map(index => {
		switch (index) {
			case 0: // x^n
				const powerAbove = selectRandomly([1, 2, 3, 4])
				return asExpression(powerAbove === 1 ? 'x' : `x^${powerAbove}`)
			case 1: // 1/x^n
				const powerBelow = selectRandomly([1, 2, 3, 4])
				return asExpression(powerBelow === 1 ? '1/x' : `1/x^${powerBelow}`)
			case 2: // sqrt(x)
				return asExpression(`sqrt(x)`)
			case 3: // root[n](x)
				return asExpression(`root[${selectRandomly([2, 3, 4])}](x)`)
			case 4: // sin(x)
				return asExpression(`sin(x)`)
			case 5: // cos(x)
				return asExpression(`cos(x)`)
			case 6: // e^x
				return asExpression(`e^x`)
			case 7: // g^x
				return asExpression(`${selectRandomly([2, 3, 5, 10])}^x`)
			case 8: // ln(x)
				return asExpression(`ln(x)`)
			case 9: // log[g](x)
				return asExpression(`log[${selectRandomly([2, 3, 5, 10])}](x)`)
			case 10: // c
				return asExpression(getRandomInteger(-12, 12, [0]))
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
