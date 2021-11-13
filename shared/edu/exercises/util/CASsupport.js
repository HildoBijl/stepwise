const { filterProperties, applyToEachParameter } = require('../../../util/objects')
const { getRandomSubset } = require('../../../util/random')

const { Variable } = require('../../../CAS')

// selectRandomVariables takes an array of variable strings, like ['x', 'y', 'z'], and an array of variables to be used, like ['a', 'b'], and then returns a randomly generated object like { a: 'z', b: 'x' }. This can then be used in exercises to have random variables.
function selectRandomVariables(availableVariables, usedVariables) {
	const result = {}
	const chosenVariables = getRandomSubset(availableVariables, usedVariables.length)
	usedVariables.forEach((variable, index) => {
		result[variable] = chosenVariables[index]
	})
	return result
}
module.exports.selectRandomVariables = selectRandomVariables

// filterVariables takes a state object, like { a: 'z', b: 'x', otherData: someNumber } and an array of variable strings, like ['a', 'b'], and then filters out all other properties. It also turns the variables into Variable objects. The result will be { a: new Variable('z'), b: new Variable('x') }.
function filterVariables(state, usedVariables) {
	const filteredVariables = filterProperties(state, usedVariables) // Filter non-variable properties out.
	return applyToEachParameter(filteredVariables, Variable.ensureVariable) // Ensure all variables are Variable objects.
}
module.exports.filterVariables = filterVariables