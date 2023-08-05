const { filterProperties, applyToEachParameter } = require('../../../util/objects')
const { getRandomSubset } = require('../../../util/random')

const { Variable } = require('../../../CAS')

// selectRandomVariables takes an array of variable strings, like ['x', 'y', 'z'], and an array of variables to be used, like ['a', 'b'], and then returns a randomly generated object like { a: 'z', b: 'x' }. This can then be used in exercises to have random variables. It also turns the parameters into CAS Variables, so the result will be { a: new Variable('z'), b: new Variable('x') }.
function selectRandomVariables(availableVariables, usedVariables) {
	const result = {}
	const chosenVariables = getRandomSubset(availableVariables, usedVariables.length)
	usedVariables.forEach((variable, index) => {
		result[variable] = new Variable(chosenVariables[index])
	})
	return result
}
module.exports.selectRandomVariables = selectRandomVariables

// filterVariables takes a state object, like { a: 'z', b: 'x', c: 2, otherData: someRandomObject } and an array of variable strings, like ['a', 'b'], including possibly an extra array of variables like ['c'], and then filters out all other properties. It also attempts to interpret everything. The result will be { a: new Variable('z'), b: new Variable('x'), c: new Integer(2) }.
function filterVariables(state, usedVariables, constants) {
	const allVariables = constants ? [...usedVariables, ...constants] : usedVariables
	const filteredVariables = filterProperties(state, allVariables) // Filter non-variable properties out.
	return applyToEachParameter(filteredVariables, Variable.ensureVariable) // Ensure all variables are Variable objects.
}
module.exports.filterVariables = filterVariables
