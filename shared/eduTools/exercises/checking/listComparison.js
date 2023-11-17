const { hasSimpleMatching } = require('../../../util')

const { getCurrentInputSolutionAndComparison } = require('./util')
const { performIndividualComparison } = require('./individualComparison')

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
