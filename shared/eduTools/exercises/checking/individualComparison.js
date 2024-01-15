const { isBasicObject } = require('../../../util')
const { Expression } = require('../../../CAS')

const { areNumbersEqual } = require('../../../inputTypes')

const { getCurrentInputSolutionAndComparison, processParameterComparison } = require('./util')

/*
 * performComparison is a general call to perform an "equals" comparison for an input parameter or set of parameters with the corresponding solution. It attempts to find the correct way of performing said comparison. It requires the following input.
 * - exerciseData: an object of the form { input: { ... }, solution: { ... }, metaData: { comparison: { ... } } }. It has the general data of the exercise and what happened with it.
 * - parameterComparison: the parameters that need to be compared. This can be an array of names ['x1', 'x2', ...] or an object with comparisons { x1: { ... options ... }, x2: (currInput, currSolution, solution) => true/false, ... }.
 * - generalComparison: (optional) a comparison function/object that is used when a parameter has no comparison/function given in the parameterComparison parameter. If this is not given, the exercise metaData comparison parameter is used instead.
 * It only returns true when all parameters give a positive response on equality.
 */
function performComparison(exerciseData, parameterComparison, generalComparison) {
	// Get the parameters out of the given objects.
	const { input, solution, metaData } = exerciseData
	const { comparison } = metaData

	// Ensure the parameterComparison is an object.
	parameterComparison = processParameterComparison(parameterComparison)

	// Walk through the parameters and perform a comparison.
	return Object.keys(parameterComparison).every(currParameter => {
		// Extract the current input, solution and parameter settings method.
		const { currInput, currSolution, currComparison } = getCurrentInputSolutionAndComparison(currParameter, input, solution, comparison, parameterComparison, generalComparison)

		// Perform the comparison for this individual parameter.
		return performIndividualComparison(currInput, currSolution, currComparison, solution)
	})
}
module.exports.performComparison = performComparison

// performIndividualComparison performs a comparison for a single parameter given its individual value and solution.
function performIndividualComparison(currInput, currSolution, currComparison, solution) {
	// If the comparison parameter is a function, call it.
	if (typeof currComparison === 'function')
		return currComparison(currInput, currSolution, solution)

	// Apparently the comparison parameter is not a function. It must be an object with comparison options then.
	if (currComparison !== undefined && !isBasicObject(currComparison))
		throw new Error(`Invalid comparison parameter: when performing a comparison, some comparison function or comparison options parameter must be given. The received parameter was not a function or basic object. Instead, its value was "${currComparison}".`)

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
		throw new Error(`Invalid parameter comparison: the given solution of parameter does not have an equals function, and hence cannot be compared to the input value. The parameter value was "${currSolution}".`)
	return currSolution.equals(currInput, currComparison)
}
module.exports.performIndividualComparison = performIndividualComparison
