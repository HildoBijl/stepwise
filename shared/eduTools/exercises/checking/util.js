const { getPropertyOrDefault } = require('../../../util')

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
module.exports.getCurrentInputSolutionAndComparison = getCurrentInputSolutionAndComparison
