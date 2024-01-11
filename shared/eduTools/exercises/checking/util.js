const { isBasicObject, keysToObject } = require('../../../util')

// processParameterComparison takes a parameterComparison parameter and processes it to ensure it's in a standard format.
function processParameterComparison(parameterComparison) {
	// In case of a single string, turn it into an array of strings.
	if (typeof parameterComparison === 'string')
		parameterComparison = [parameterComparison]

	// In case of an array of strings, turn it into object form, with default value undefined.
	if (Array.isArray(parameterComparison))
		parameterComparison = keysToObject(parameterComparison, () => undefined, false)

	// We must have a basic object now.
	if (!isBasicObject(parameterComparison))
		throw new Error(`Invalid parameterComparison given: expected either a string, an array of strings or an object with options, but received something of type ${typeof parameterComparison}.`)

	// All done.
	return parameterComparison
}
module.exports.processParameterComparison = processParameterComparison

// getCurrentInputSolutionAndComparison takes a parameter and attempts to retrieve the input, solution and parameter settings through which the parameter should be checked. It throws an error upon missing values.
function getCurrentInputSolutionAndComparison(currParameter, input, solution, comparison, parameterComparison, generalComparison) {
	const currInput = getInputValue(currParameter, input)
	const currSolution = getSolutionValue(currParameter, solution)
	const currComparison = getComparison(currParameter, comparison, parameterComparison, generalComparison)
	return { currInput, currSolution, currComparison }
}
module.exports.getCurrentInputSolutionAndComparison = getCurrentInputSolutionAndComparison

// getInput gets the given parameter out of the input and throws an error if it's missing.
function getInputValue(currParameter, input) {
	const currInput = input[currParameter]
	if (currInput === undefined)
		throw new Error(`Field check error: could not find an input for field "${currParameter}". Make sure that there is an input field named "${currParameter}".`)
	return currInput
}
module.exports.getInputValue = getInputValue

// getSolution gets the given parameter out of the solution and throws an error if it's missing.
function getSolutionValue(currParameter, solution) {
	if (!solution)
		throw new Error(`Field check error: no solution present. Make sure that the exercise has a getSolution function or object.`)
	const currSolution = solution[currParameter]
	if (currSolution === undefined)
		throw new Error(`Field check error: could not find a solution answer for field "${currParameter}". Make sure it is exported from the getSolution function inside an object. The getSolution function should return something of the form { param1: ..., param2: ... }.`)
	return currSolution
}
module.exports.getSolutionValue = getSolutionValue

// getComparison gets a variety of comparison source objects and tries to find a comparison method in them. First there is the given parameter comparison object, which takes precedence. Then there is a potentially generally defined comparison method. Finally, the fallback is the exercise metaData comparison object.
function getComparison(currParameter, comparison, parameterComparison, generalComparison) {
	// On only a comparison function, use it as default.
	if (typeof comparison === 'function')
		comparison = { default: comparison }

	// Get a comparison function/object according to the specified preference order.
	const currComparison = parameterComparison[currParameter] || generalComparison || (comparison && comparison[currParameter]) || comparison?.default
	if (!currComparison)
		throw new Error(`Field check error: no comparison method defined. A comparison function or options-object should be defined either in the exercise metaData, or in the calling compare function.`)

	// All done!
	return currComparison
}
module.exports.getComparison = getComparison
