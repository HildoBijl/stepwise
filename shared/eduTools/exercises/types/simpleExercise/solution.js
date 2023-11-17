const { filterProperties } = require('../../../../util')

// assembleSolution takes an object with dependency data and assembles a solution object from it.
function assembleSolution(dependencyData, state, input) {
	const { getSolution, getStaticSolution, getInputDependency, dependentFields, getDynamicSolution } = dependencyData

	// Get the static solution.
	const currGetSolution = getSolution || getStaticSolution // They perform the same function.
	if (!currGetSolution)
		throw new Error(`Invalid assembleSolution call: could not find a getSolution or getStaticSolution function. Hence failed to assemble a solution object.`)
	const staticSolution = currGetSolution(state)

	// If there is no dynamic solution, we're done.
	if (!getDynamicSolution)
		return staticSolution

	// Get the input dependency and use it to find the dynamic solution.
	const filteredInput = dependentFields ? filterProperties(input, dependentFields) : input
	const inputDependency = getInputDependency ? getInputDependency(filteredInput, staticSolution) : filteredInput
	const dynamicSolution = getDynamicSolution(inputDependency, staticSolution, state)
	return { ...(staticSolution || {}), ...(dynamicSolution || {}) }
}
module.exports.assembleSolution = assembleSolution
