const { hasSimpleMatching } = require('../../../util')

const { processParameterComparison, getInputValue, getSolutionValue, getComparison } = require('./util')
const { performIndividualComparison } = require('./individualComparison')

// performListComparison does the same as performComparison, but it works for lists in which each element may match an element from another list. For instance, if the user needs to give the first three prime numbers and gives [5,2,3] then this is still an OK answer. The comparison method can be specified for each solution field (as second parameter) or as a single comparison method for all fields (as third parameter). But ideally it already resides in the comparison parameter of the exercise metaData.
function performListComparison(exerciseData, parameterComparison, generalComparison) {
	// Process the given options.
	parameterComparison = processParameterComparison(parameterComparison)
	const parameters = Object.keys(parameterComparison)

	// Walk through the parameters to try and match them.
	return hasSimpleMatching(parameters, parameters, (inputParameter, solutionParameter) => performIndividualListComparison(inputParameter, solutionParameter, exerciseData, parameterComparison, generalComparison))
}
module.exports.performListComparison = performListComparison

// performIndividualListComparison takes two parameter IDs: one for the input and one for the solution. It then checks if those two are considered equal.
function performIndividualListComparison(inputParameter, solutionParameter, exerciseData, parameterComparison, generalComparison) {
	const { input, solution, metaData } = exerciseData

	// Extract values.
	const currInput = getInputValue(inputParameter, input)
	const currSolution = getSolutionValue(solutionParameter, solution)
	const currComparison = getComparison(solutionParameter, metaData.comparison, parameterComparison, generalComparison)

	// Run the comparison.
	return performIndividualComparison(currInput, currSolution, currComparison, solution)
}
module.exports.performIndividualListComparison = performIndividualListComparison
