const { getRandomInteger } = require('@step-wise/utils')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'demo',
}

function generateState() {
	return { x: getRandomInteger(-100, 100) }
}

function getSolution({ x }) {
	return { ans: x }
}

function checkInput(data) {
	return compare('ans', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
