// ToDo: check if this can be directly incorporated into the calling function. Who still needs this function?
// getCurrentInputSolutionAndComparison takes a parameter and attempts to retrieve the input, solution and parameter settings through which the parameter should be checked. It throws an error upon missing values.
function getCurrentInputSolutionAndComparison(currParameter, input, solution, comparison, parameterComparison) {
	// Extract the current input value.
	const currInput = input[currParameter]
	if (currInput === undefined)
		throw new Error(`Field check error: could not find an input for field "${currParameter}". Make sure that there is an input field named "${currParameter}".`)

	// Extract the current solution
	if (!solution)
		throw new Error(`Field check error: no solution present. Make sure that the exercise has a getSolution function or object.`)
	const currSolution = solution[currParameter]
	if (currSolution === undefined)
		throw new Error(`Field check error: could not find a solution answer for field "${currParameter}". Make sure it is exported from the getSolution function inside an object. The getSolution function should return something of the form { param1: ..., param2: ... }.`)

	// Extract the comparison method. First try the specified parameter comparisons, and then the general ones from the metaData.
	const currComparison = parameterComparison[currParameter] || (comparison && comparison[currParameter]) || comparison?.default

	// Gather and return the results.
	return { currInput, currSolution, currComparison }
}
module.exports.getCurrentInputSolutionAndComparison = getCurrentInputSolutionAndComparison
