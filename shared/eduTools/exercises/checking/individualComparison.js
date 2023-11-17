const { isBasicObject } = require('../../../util')
const { Expression } = require('../../../CAS')

const { areNumbersEqual } = require('../../../inputTypes/Integer')

const { getCurrentInputSolutionAndComparison } = require('./util')

/*
 * performComparison is a general call to perform an "equals" comparison for an input parameter or set of parameters with the corresponding solution. It attempts to find the correct way of performing said comparison. It requires the following input.
 * - parameters: a string like "ans" or (multi-parameter case) an array of strings like ["x", "y"] of parameter IDs to check.
 * - input: an input answer or (multi-parameter case) an object { x: [...], y: [...] } with input answers.
 * - solution: a correct answer or (multi-parameter case) an object { x: [...], y: [...] } with the correct answers.
 * - comparison: this can be either of two types of parameters.
 *   x For basic cases: a function comparing the two values. It is called with (currInput, currSolution, solution, options). The full solution is given in case the comparison function requires extra data from it.
 *   x For numbers, units and similar: an object with comparison options. A call will be made to currSolution.equals(currInput, comparisonOptions) and the result is returned.
 *   In the multi-parameter case the comparison can be an object { param1: [param1Comparison], default: [defaultComparison] } or similar.
 * In the multi-parameter case, only true is returned when all parameters match out. When one parameter does not match out, false is returned without checking the other parameters.
 */
function performComparison(parameters, input, solution, comparison) {
	// Check if there is a single-parameter case or a multi-parameter case. Adjust accordingly.
	let singleParameterCase = false
	if (!Array.isArray(parameters)) {
		singleParameterCase = true
		parameters = [parameters]
	}

	// Walk through the parameters and perform a comparison.
	return parameters.every(currParameter => {
		// Extract the current input, solution and comparison method.
		const { currInput, currSolution, currComparison } = getCurrentInputSolutionAndComparison(currParameter, input, solution, comparison, singleParameterCase)

		// Perform the comparison for this individual parameter.
		return performIndividualComparison(currParameter, currInput, currSolution, currComparison, solution)
	})
}
module.exports.performComparison = performComparison

// performIndividualComparison performs a comparison for a single parameter given its individual value and solution.
function performIndividualComparison(currParameter, currInput, currSolution, currComparison, solution) {
	// If the comparison parameter is a function, call it.
	if (typeof currComparison === 'function')
		return currComparison(currInput, currSolution, solution)

	// Apparently the comparison parameter is not a function. It must be an object with comparison options then.
	if (!isBasicObject(currComparison))
		throw new Error(`Invalid comparison parameter: when performing a comparison, some comparison function or comparison options parameter must be given. The received parameter, however, was not a function or basic object. Instead, its value was "${currComparison}".`)

	// If the parameters are pure numbers, compare them using number comparison.
	if (currSolution instanceof Expression && currSolution.isNumeric())
		currSolution = currSolution.number
	if (typeof currSolution === 'number') {
		if (currInput instanceof Expression) {
			if (!currInput.isNumeric())
				return false
			currInput = currInput.number
		}
		return areNumbersEqual(currInput, currSolution, currComparison)
	}

	// We have an object-based parameter. Use the built-in equals function of the solution.
	if (typeof currSolution.equals !== 'function')
		throw new Error(`Invalid parameter comparison: the given solution of parameter "${currParameter}" does not have an equals function, and hence cannot be compared to the input value. The parameter value was "${currSolution}".`)
	return currSolution.equals(currInput, currComparison)
}
module.exports.performIndividualComparison = performIndividualComparison
