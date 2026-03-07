const { randomInteger } = require('../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../eduTools')

const metaData = {
	skill: 'test',
}

function generateState() {
	return { x: randomInteger(-100, 100) }
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
