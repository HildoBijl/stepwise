const { filterProperties, isBasicObject } = require('../../../../util')

// assembleSolution takes a getSolution function or object and assembles a solution object from it.
function assembleSolution(getSolution, state, input) {
	// If getSolution is a function, just run it.
	if (typeof getSolution === 'function')
		return getSolution(state)

	// So getSolution should be an object.
	if (!isBasicObject(getSolution))
		throw new Error(`Invalid getSolution parameter: expected either a getSolution function or a getSolution object. Got a parameter of type ${typeof getSolution}.`)
	const { getStaticSolution, getInputDependency, dependentFields, getDynamicSolution } = getSolution

	// Get the static solution.
	if (typeof getStaticSolution !== 'function')
		throw new Error(`Invalid assembleSolution call: could not find a getStaticSolution function in the getSolution object. Hence failed to assemble a solution object.`)
	const staticSolution = getStaticSolution(state)

	// If there is no dynamic solution, we're done.
	if (!getDynamicSolution)
		return staticSolution

	// Get the input dependency and use it to find the dynamic solution. Merge it with the static solution.
	const filteredInput = dependentFields ? filterProperties(input, dependentFields) : input
	const inputDependency = getInputDependency ? getInputDependency(filteredInput, staticSolution) : filteredInput
	const dynamicSolution = getDynamicSolution(inputDependency, staticSolution, state)
	return { ...(staticSolution || {}), ...(dynamicSolution || {}) }
}
module.exports.assembleSolution = assembleSolution
