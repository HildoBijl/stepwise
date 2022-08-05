const { filterProperties } = require('../../../util/objects')
const { toFO } = require('../../../inputTypes')

// getSimpleExerciseProcessor takes a checkInput function that checks the input for a SimpleExercise and returns a processAction function.
function getSimpleExerciseProcessor(checkInput, data) {
	return ({ progress, action, state, history, updateSkills }) => {
		if (progress.done)
			return progress // Weird ... we're already done.

		switch (action.type) {
			case 'input':
				const correct = checkInput(state, toFO(action.input, true))
				if (correct) {
					updateSkills(data.skill, true) // Correctly solved.
					updateSkills(data.setup, true)
					return { solved: true, done: true }
				} else {
					updateSkills(data.skill, false) // Incorrectly solved.
					updateSkills(data.setup, false)
					return {}
				}

			case 'giveUp':
				// When there have been no attempts yet, downgrade too.
				if (history.length === 0) {
					updateSkills(data.skill, false)
					updateSkills(data.setup, false)
				}
				return { givenUp: true, done: true }

			default:
				throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
		}
	}
}
module.exports.getSimpleExerciseProcessor = getSimpleExerciseProcessor

// getLastInput takes a history object and returns the last given input.
function getLastInput(history) {
	for (let i = history.length - 1; i >= 0; i--) {
		if (history[i].action.type === 'input')
			return history[i].action.input
	}
	return null
}
module.exports.getLastInput = getLastInput

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