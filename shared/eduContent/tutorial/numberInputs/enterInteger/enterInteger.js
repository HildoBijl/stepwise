const { getRandomInteger } = require('@step-wise/utils')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

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

function checkInput(data) {
	return compare('ans', data) // Basically returns whether state.x === input.ans, but then through the Integer's type checker.
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
