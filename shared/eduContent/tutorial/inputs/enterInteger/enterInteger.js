const { getRandomInteger } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'enterInteger',
}

function generateState(example) {
	const limit = example ? 20 : 100
	return { x: getRandomInteger(-limit, limit) }
}

function getSolution({ x }) {
	return { ans: x }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans') // Basically returns whether state.x === input.ans, but then through a convoluted generalized way.
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
