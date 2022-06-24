const { hasSimpleMatching } = require('../../../util/arrays')
const { isBasicObject, getPropertyOrDefault } = require('../../../util/objects')
const { Expression } = require('../../../CAS')

const { areNumbersEqual } = require('../../../inputTypes/Integer')

/*
 * performComparison is a general call to perform an "equals" comparison for an input parameter or set of parameters with the corresponding solution. It attempts to find the correct way of performing said comparison. It requires the following input.
 * - parameters: a string like "ans" or (multi-parameter case) an array of strings like ["x", "y"] of parameter IDs to check.
 * - input: an input answer or (multi-parameter case) an object { x: [...], y: [...] } with input answers.
 * - solution: a correct answer or (multi-parameter case) an object { x: [...], y: [...] } with the correct answers.
 * - comparison: this can be either of two types of parameters.
 *   x For basic cases: a function comparing the two values. It is called with (currInput, currSolution, solution, options). The full solution is given in case the comparison function requires extra data from it.
 *   x For numbers, units and similar: an object with comparison options. A call will be made to currSolution.equals(currInput, comparisonOptions) and the result is returned.
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

// getCurrentInputSolutionAndComparison takes a parameter and attempts to retrieve the input, solution and comparison method for the given parameter from the given objects. It throws an error upon missing values.
function getCurrentInputSolutionAndComparison(currParameter, input, solution, comparison, singleParameterCase, throwErrorOnMissing = true) {
	// Extract the current input value.
	const currInput = getPropertyOrDefault(input, currParameter, false, singleParameterCase, throwErrorOnMissing, `Field check error: could not find an input for field "${currParameter}". Make sure that there is an input field named "${currParameter}".`)

	// Extract the current solution
	const currSolution = getPropertyOrDefault(solution, currParameter, false, singleParameterCase, throwErrorOnMissing, `Field check error: could not find a solution answer for field "${currParameter}". Make sure it is exported from the getSolution function. Either the getSolution function should export an object { param1: ..., param2: ... } or, in case the exercise has only a single answer, the getSolution function can also export this single answer. In this case the "parameters" argument may not be an array.`)

	// Extract the comparison method.
	if (comparison === undefined)
		throw new Error(`Missing comparison method: expected a comparison method - a comparison function or a comparison options object - but none were given. Note that, when using default performComparison function, you should provide a comparison function or a comparison options object. The full object itself can be of the form { default: [...], input3: [...], input5: [...] }. Here, each parameter can be either a comparison function of the form (inputValue, solutionValue, solution) => true/false, or a comparison options object taken by solutionValue.equals(inputValue, comparisonOptions). Most parameter types support an empty object {} as comparisonOptions to use default values.`)
	const currComparison = getPropertyOrDefault(comparison, currParameter, true, singleParameterCase, throwErrorOnMissing, `Field comparison error: could not find a comparison function or comparison options for field "${currParameter}". Make sure that the comparison object has a parameter with this name, or otherwise a parameter "default". (This could even be an empty object if default comparison options are used.)`)

	// Gather and return the results.
	return { currInput, currSolution, currComparison }
}

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

// performListComparison does the same as performComparison, but it works for lists in which each element may match an element from another list. For instance, if the user needs to give the first three prime numbers and gives [5,2,3] then this is still an OK answer. The comparison method can be specified for each solution field, or as a single comparison method for all fields.
function performListComparison(parameters, input, solution, comparison) {
	return hasSimpleMatching(parameters, parameters, (inputParameter, solutionParameter) => performIndividualListComparison(inputParameter, solutionParameter, input, solution, comparison))
}
module.exports.performListComparison = performListComparison

// performIndividualListComparison takes two parameter IDs: one for the input and one for the solution. It then checks if those two are considered equal.
function performIndividualListComparison(inputParameter, solutionParameter, input, solution, comparison) {
	const { currInput } = getCurrentInputSolutionAndComparison(inputParameter, input, solution, comparison, false, false)
	const { currSolution, currComparison } = getCurrentInputSolutionAndComparison(solutionParameter, input, solution, comparison, true, true)
	return currInput !== undefined && performIndividualComparison(solutionParameter, currInput, currSolution, currComparison, solution)
}
module.exports.performIndividualListComparison = performIndividualListComparison
