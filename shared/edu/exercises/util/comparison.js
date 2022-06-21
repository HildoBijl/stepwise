const { hasSimpleMatching } = require('../../../util/arrays')
const { isBasicObject, getPropertyOrDefault } = require('../../../util/objects')

const { areNumbersEqual } = require('../../../inputTypes/Integer')

/*
 * performComparison is a quick and uniform way to perform an "equals" comparison for a parameter or set of parameters with the corresponding answer. It requires the following input.
 * - parameters: a string like "ans" or (multi-parameter case) an array of strings like ["x", "y"] of parameter IDs to check.
 * - input: an input answer or (multi-parameter case) an object { x: [...], y: [...] } with input answers.
 * - solution: a correct answer or (multi-parameter case) an object { x: [...], y: [...] } with the correct answers.
 * - comparisonOrEqualityOptions: this can be either of two types of parameters.
 *   x For numbers, units and similar, this is often an equalityOptions object. A call will be made to currCorrect.equals(currInput, equalityOptions) and the result is returned.
 *   x For more complex objects, this is a comparison function. A call will be made to comparison(currInput, currCorrect, solution). The full solution is given in case the comparison function requires extra data from it.
 * In the multi-parameter case, only true is returned when all parameters match out. When one parameter does not match out, false is returned without checking the other parameters.
 */

function performComparison(parameters, input, solution, comparisonOrEqualityOptions) {
	// Process input.
	let singleParameter = false
	if (!Array.isArray(parameters)) {
		singleParameter = true
		parameters = [parameters]
	}

	return parameters.every(currParameter => {
		// Extract the input, the correct answer and the check method. Throw an error if it's missing.
		const currInput = getPropertyOrDefault(input, currParameter, false, singleParameter, true, `Field check error: could not find an input for field "${currParameter}". Make sure that there is an input field named "${currParameter}".`)
		const currCorrect = getPropertyOrDefault(solution, currParameter, false, singleParameter, true, `Field check error: could not find a correct answer for field "${currParameter}". Make sure it is exported from the getSolution function. Either the getSolution function should export an object { param1: ..., param2: ... } or, in case the exercise has only a single answer, the getSolution function can also export this single answer. In this case the "parameters" argument may not be an array.`)
		if (comparisonOrEqualityOptions === undefined)
			throw new Error(`Missing comparison method: expected a comparison method - a comparison function or an equality options object - but none were given. Note that, when using default performComparison function, you should provide a comparison function or an equality options object. The full object itself can be of the form { default: [...], input3: [...], input5: [...] }. Here, each parameter can be either a comparison function of the form (inputValue, correctValue, solution) => true/false, or an equality options object taken by correctValue.equals(inputValue, equalityOptions). Most parameter types support an empty object {} as equalityOptions to use default values.`)
		const currComparisonOrEqualityOptions = getPropertyOrDefault(comparisonOrEqualityOptions, currParameter, true, singleParameter, true, `Field comparison error: could not find a comparison function or equality options for field "${currParameter}". Make sure that the comparison or equality options object has a parameter with this name, or otherwise a parameter "default". (This could even be an empty object if default equality options are used.)`)

		// If the comparison parameter is a function, call it.
		if (typeof currComparisonOrEqualityOptions === 'function') {
			const comparison = currComparisonOrEqualityOptions
			return comparison(currInput, currCorrect, solution)
		}

		// Apparently the comparison parameter is not a function. It must be an object with equality options then.
		if (!isBasicObject(currComparisonOrEqualityOptions))
			throw new Error(`Invalid comparison parameter: when performing a comparison, some comparison function or equality options parameter must be given. The received parameter, however, was not a function or basic object. Instead, its value was "${currComparisonOrEqualityOptions}".`)
		const currEqualityOptions = currComparisonOrEqualityOptions

		// If the parameters are pure numbers, compare them using number comparison.
		const isInputANumber = currInput.constructor === (0).constructor
		const isCorrectANumber = currCorrect.constructor === (0).constructor
		if (isInputANumber || isCorrectANumber) {
			const currInputAsNumber = (isInputANumber ? currInput : currInput.number)
			const currCorrectAsNumber = (isCorrectANumber ? currCorrect : currCorrect.number)
			return areNumbersEqual(currCorrectAsNumber, currInputAsNumber, currEqualityOptions)
		}

		// We have an object-based parameter. Use the built-in equals function of the correct answer.
		if (typeof currCorrect.equals !== 'function')
			throw new Error(`Invalid parameter comparison: the given parameter does not have an equals function, and hence cannot be compared to the input value. The parameter value was "${currCorrect}".`)
		return currCorrect.equals(currInput, currEqualityOptions)
	})
}
module.exports.performComparison = performComparison

// performListComparison does the same as performComparison, but it works for lists in which each element may match an element from another list. For instance, if the user needs to give the first three prime numbers and gives [5,2,3] then this is still an OK answer.
function performListComparison(parameters, input, solution, comparisonOrEqualityOptions) {
	return hasSimpleMatching(parameters, parameters, (inputParameter, solutionParameter) => performComparison([solutionParameter], { [solutionParameter]: input[inputParameter] }, { [solutionParameter]: solution[solutionParameter] }, comparisonOrEqualityOptions))
}
module.exports.performListComparison = performListComparison