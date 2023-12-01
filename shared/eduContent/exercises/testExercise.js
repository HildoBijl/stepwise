const { getRandomInteger } = require('../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../eduTools')

const data = {
	skill: 'fillInInteger',
	comparison: {},
}

function generateState() {
	return { x: getRandomInteger(-100, 100) }
}

function getSolution({ x }) {
	return { ans: x }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('ans', input, solution, data.comparison) // Basically returns whether state.ans === input.ans in convoluted but generalized way.
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
